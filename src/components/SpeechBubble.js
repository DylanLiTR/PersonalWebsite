const TYPING_SPEED = 50;
const SENTENCE_DELAY = 2000; // Delay before showing the next sentence
const TEXT_SCALE = 0.3;
const WRAP_WIDTH = 200 / TEXT_SCALE;
const FONT_SIZE = 4 / TEXT_SCALE;

export default class SpeechBubble {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.sentenceQueue = [];
    this.typing = false;

    this.container = this.scene.add.container(this.x, this.y).setDepth(11);
  }

  addText(text) {
    const newSentences = text.match(/[^.!?]+[.!?]*/g) || [text]; // Split text into sentences
    this.sentenceQueue.push(...newSentences);

    if (!this.typing) {
      this.processQueue();
    }
  }

  processQueue() {
    if (this.sentenceQueue.length === 0) {
      this.speechText.destroy();
      this.bubble.destroy();
      this.typing = false;
      return;
    }
    if (this.speechText) this.speechText.destroy();
    if (this.bubble) this.bubble.destroy();

    this.typing = true;
    const sentence = this.sentenceQueue.shift().trim();
    this.createBubble(sentence);
    this.typeText(sentence, () => {
      this.scene.time.delayedCall(SENTENCE_DELAY, () => this.processQueue());
    });
  }

  createBubble(sentence) {
    const textObject = this.createText(sentence);

    // Measure text size
    const textWidth = textObject.width * TEXT_SCALE;
    const textHeight = textObject.height * TEXT_SCALE;
    textObject.destroy();

    this.wrapWidth = Math.min(WRAP_WIDTH, textWidth / TEXT_SCALE);

    // Create the speech bubble
    this.bubble = this.scene.add.nineslice(
      0, 0, 
      'bubble', undefined, 
      textWidth + 10, textHeight + 10, 
      6, 6, 6, 6
    );
    this.container.add(this.bubble);

    // Add the text
    this.speechText = this.createText("");
    this.container.add(this.speechText);

    this.scene.minimap.ignore([this.bubble, this.speechText]);
  }

  createText(content) {
    return this.scene.add.text(0, 0, content, {
      fontFamily: '"Press Start 2P", sans-serif',
      fontSize: FONT_SIZE + 'px',
      color: '#000',
      wordWrap: { width: this.wrapWidth },
      align: 'left'
    }).setOrigin(0.5).setScale(TEXT_SCALE).setLineSpacing(FONT_SIZE / 4);
  }

  typeText(sentence, onComplete) {
    let i = 0;
    this.speechText.setText('');

    this.scene.time.addEvent({
      delay: TYPING_SPEED,
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

  destroy() {
    this.container.destroy();
  }
}
