import { useState, useEffect } from 'react';
import './DylanTime.css';

const DylanTime = () => {
  const [time, setTime] = useState(
    new Date().toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newTime = new Date().toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      setTime(newTime);
    }, 60000); 

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="pixel-font ui-text dylan-time">
      Dylan's Time: {time}
    </div>
  );
};

export default DylanTime;