import { DEFAULT_ZOOM } from "./constants.js"

const TYPING_DELAY = 40;
const DELAY_FACTOR = 1000; 
const DELAY_RATE = 30; // ms of delay per character in sentence
const TEXT_SCALE = 0.2;
const WRAP_WIDTH = Math.min(200 / TEXT_SCALE, window.innerWidth * 0.9 / TEXT_SCALE / DEFAULT_ZOOM);
const FONT_SIZE = window.innerWidth > 500 ? 4 / TEXT_SCALE : 3 / TEXT_SCALE;

export default class SpeechBubble {
  constructor(scene, npc) {
    this.scene = scene;
    this.npc = npc
    this.sentenceQueue = [];
    this.typing = false;
    this.generating = false; // start as false, true when generating a response
    
    this.reminder = this.scene.time.addEvent({
      delay: 60000,
      callback: this.remindPrompt,
      callbackScope: this,
      loop: true
    });

    this.container = this.scene.add.container(this.npc.x + this.npc.width / 2, this.npc.y - 12).setDepth(11);
  }

  addText(text) {
    const newSentences = text.match(/[^.!?]+[.!?](\s|$)/g) || [text]; // Split text into sentences
    this.sentenceQueue.push(...newSentences);
    this.generating = false;
    this.reminder.reset();

    if (!this.typing) {
      this.processQueue();
    }
  }

  processQueue() {
    if (this.sentenceQueue.length === 0) {
      if (!this.generating) {
        this.speechText.destroy();
        this.bubble.destroy();
        this.typing = false;
        return;
      }
      this.sentenceQueue.push("...");
    }
    if (this.speechText) this.speechText.destroy();
    if (this.bubble) this.bubble.destroy();

    this.typing = true;
    let sentence = this.sentenceQueue.shift().trim();
    while (sentence.length == 0) sentence = this.sentenceQueue.shift().trim();
    this.createBubble(sentence);
    this.typeText(sentence, () => {
      this.scene.time.delayedCall(DELAY_FACTOR + DELAY_RATE * sentence.length, () => this.processQueue());
    });
  }

  createBubble(sentence) {
    const textObject = this.createText(sentence, WRAP_WIDTH);

    // Measure text size
    const textWidth = textObject.width * TEXT_SCALE;
    const textHeight = textObject.height * TEXT_SCALE;
    textObject.destroy();

    const wrapWidth = Math.min(WRAP_WIDTH, textWidth / TEXT_SCALE);

    // Create the speech bubble
    this.bubble = this.scene.add.nineslice(
      0, 0, 
      'bubble', undefined, 
      textWidth + 10, textHeight + 10, 
      6, 6, 6, 6
    );
    this.container.add(this.bubble);

    // Add the text
    this.speechText = this.createText("", wrapWidth);
    this.container.add(this.speechText);

    if (this.scene.minimap) this.scene.minimap.ignore([this.bubble, this.speechText]);
  }

  createText(content, wrapWidth) {
    return this.scene.add.text(0, 0, content, {
      fontFamily: '"Press Start 2P", sans-serif',
      fontSize: FONT_SIZE + 'px',
      color: '#000',
      wordWrap: { width: wrapWidth },
      align: 'left'
    }).setOrigin(0.5).setScale(TEXT_SCALE).setLineSpacing(FONT_SIZE / 3);
  }

  typeText(sentence, onComplete) {
    let i = 0;
    this.speechText.setText('');

    let typingDelay = TYPING_DELAY;
    if (this.generating && sentence === "...") typingDelay *= 5;
    this.scene.time.addEvent({
      delay: typingDelay,
      repeat: sentence.length - 1,
      callback: () => {
        this.speechText.setText(sentence.substring(0, i + 1));
        ++i;
        if (i === sentence.length && onComplete) {
          onComplete();
        }
      }
    });
  }

  remindPrompt() {
    if (this.sentenceQueue.length !== 0 || this.typing || this.generating) return;
    this.sentenceQueue.push("Remember that I'm here to answer any of your questions!");
    this.processQueue();
  }

  update() {
    // Update speech bubble position to follow the NPC
    this.container.setPosition(this.npc.x + this.npc.width / 2, this.npc.y - 12);
  }

  destroy() {
    this.container.destroy();
  }
}
