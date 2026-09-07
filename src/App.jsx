import { useEffect, useState } from "react";
import "./App.css";

const timeZones = [
  {
    id: "mumbai",
    city: "Mumbai",
    country: "India",
    flag: "🇮🇳",
    zone: "Asia/Kolkata",
  },
  {
    id: "dubai",
    city: "Dubai",
    country: "UAE",
    flag: "🇦🇪",
    zone: "Asia/Dubai",
  },
  {
    id: "london",
    city: "London",
    country: "United Kingdom",
    flag: "🇬🇧",
    zone: "Europe/London",
  },
  {
    id: "newyork",
    city: "New York",
    country: "USA",
    flag: "🇺🇸",
    zone: "America/New_York",
  },
  {
    id: "tokyo",
    city: "Tokyo",
    country: "Japan",
    flag: "🇯🇵",
    zone: "Asia/Tokyo",
  },
  {
    id: "singapore",
    city: "Singapore",
    country: "Singapore",
    flag: "🇸🇬",
    zone: "Asia/Singapore",
  },
];

function getTime(date, zone, hour12 = true, seconds = true) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hour: "2-digit",
    minute: "2-digit",
    second: seconds ? "2-digit" : undefined,
    hour12,
  }).format(date);
}

function getDate(date, zone) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getClockParts(date, zone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(date);

  const get = (type) =>
    Number(parts.find((item) => item.type === type)?.value || 0);

  return {
    hour: get("hour") % 12,
    minute: get("minute"),
    second: get("second"),
  };
}

function AnalogClock({ date, zone }) {
  const { hour, minute, second } = getClockParts(date, zone);

  const hourRotation = hour * 30 + minute * 0.5;
  const minuteRotation = minute * 6 + second * 0.1;
  const secondRotation = second * 6;

  return (
    <div className="analog-clock">
      <div className="clock-number number-12">12</div>
      <div className="clock-number number-3">3</div>
      <div className="clock-number number-6">6</div>
      <div className="clock-number number-9">9</div>

      <div
        className="clock-hand hour-hand"
        style={{
          transform: `translateX(-50%) rotate(${hourRotation}deg)`,
        }}
      />

      <div
        className="clock-hand minute-hand"
        style={{
          transform: `translateX(-50%) rotate(${minuteRotation}deg)`,
        }}
      />

      <div
        className="clock-hand second-hand"
        style={{
          transform: `translateX(-50%) rotate(${secondRotation}deg)`,
        }}
      />

      <div className="clock-center" />
    </div>
  );
}

function WorldClock({
  clock,
  date,
  hour12,
  showSeconds,
  onRemove,
}) {
  return (
    <div className="world-card">
      <div className="world-top">
        <div>
          <span className="flag">{clock.flag}</span>
          <span className="city">{clock.city}</span>
        </div>

        <button
          className="remove-btn"
          onClick={() => onRemove(clock.id)}
        >
          ×
        </button>
      </div>

      <div className="world-time">
        {getTime(date, clock.zone, hour12, showSeconds)}
      </div>

      <div className="world-country">
        {clock.country}
      </div>

      <div className="world-zone">
        {clock.zone}
      </div>
    </div>
  );
}

function App() {
  const [time, setTime] = useState(new Date());

  const [hour12, setHour12] = useState(true);
  const [showSeconds, setShowSeconds] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const [selectedZone, setSelectedZone] = useState("mumbai");

  const [worldClocks, setWorldClocks] = useState([
    timeZones[0],
    timeZones[1],
    timeZones[2],
    timeZones[3],
  ]);

  const [alarms, setAlarms] = useState([]);

  const [alarmTime, setAlarmTime] = useState("");
  const [alarmLabel, setAlarmLabel] = useState("");

  /* =========================
     REAL-TIME CLOCK
  ========================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* =========================
     ALARM CHECK
  ========================= */

  useEffect(() => {
    const currentTime = time.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setAlarms((previous) =>
      previous.map((alarm) => {
        if (
          alarm.enabled &&
          alarm.time === currentTime &&
          !alarm.triggered
        ) {
          alert(`⏰ ${alarm.label}`);

          return {
            ...alarm,
            enabled: false,
            triggered: true,
          };
        }

        return alarm;
      })
    );
  }, [time]);

  /* =========================
     MAIN CLOCK
  ========================= */

  const mainClock = timeZones.find(
    (clock) => clock.id === selectedZone
  );

  /* =========================
     WORLD CLOCK
  ========================= */

  function addWorldClock() {
    const clock = timeZones.find(
      (item) => item.id === selectedZone
    );

    if (!clock) return;

    const alreadyExists = worldClocks.some(
      (item) => item.id === clock.id
    );

    if (!alreadyExists) {
      setWorldClocks((previous) => [
        ...previous,
        clock,
      ]);
    }
  }

  function removeWorldClock(id) {
    setWorldClocks((previous) =>
      previous.filter((clock) => clock.id !== id)
    );
  }

  /* =========================
     ALARMS
  ========================= */

  function addAlarm(event) {
    event.preventDefault();

    if (!alarmTime) return;

    const newAlarm = {
      id: Date.now(),
      time: alarmTime,
      label: alarmLabel || "Alarm",
      enabled: true,
      triggered: false,
    };

    setAlarms((previous) => [
      ...previous,
      newAlarm,
    ]);

    setAlarmTime("");
    setAlarmLabel("");
  }

  function toggleAlarm(id) {
    setAlarms((previous) =>
      previous.map((alarm) =>
        alarm.id === id
          ? {
              ...alarm,
              enabled: !alarm.enabled,
              triggered: false,
            }
          : alarm
      )
    );
  }

  function deleteAlarm(id) {
    setAlarms((previous) =>
      previous.filter((alarm) => alarm.id !== id)
    );
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>
      
      {/* HEADER */}

      <header className="header">
        <div className="header-content">

          <div>
            <div className="brand">
              <span className="brand-icon">◷</span>

              <span>
                TIME<span>SYNC</span>
              </span>
            </div>

            <p className="subtitle">
              Real-Time World Clock Dashboard
            </p>
          </div>

          <div className="profile">

            <div className="profile-info">
              <strong>Misbah Shaikh</strong>
              <span>PRN: 12414009</span>
            </div>

            <div className="profile-avatar">
              MS
            </div>

          </div>

        </div>
      </header>


      {/* MAIN */}

      <main className="dashboard">

        {/* =========================
            HERO
        ========================= */}

        <section className="hero-grid">

          {/* MAIN CLOCK */}

          <div className="main-clock-card">

            <div className="card-header">

              <div>

                <span className="live-indicator">
                  <span />
                  LIVE
                </span>

                <h1>
                  {mainClock.city}
                </h1>

                <p>
                  {mainClock.country}
                  {" • "}
                  {mainClock.zone}
                </p>

              </div>

              <span className="main-flag">
                {mainClock.flag}
              </span>

            </div>


            <div className="clock-display">

              <AnalogClock
                date={time}
                zone={mainClock.zone}
              />

              <div className="digital-container">

                <div className="digital-time">
                  {getTime(
                    time,
                    mainClock.zone,
                    hour12,
                    showSeconds
                  )}
                </div>

                <div className="digital-date">
                  {getDate(
                    time,
                    mainClock.zone
                  )}
                </div>

                <div className="utc-offset">
                  LIVE • {mainClock.zone}
                </div>

              </div>

            </div>

          </div>


          {/* CONTROLS */}

          <div className="controls-card">

            <div className="section-heading">

              <div>
                <span className="section-icon">
                  ⚙
                </span>

                <h2>
                  Dashboard Controls
                </h2>
              </div>

            </div>


            <div className="control-list">

              <div className="control-row">

                <div>
                  <strong>
                    12 / 24 Hour
                  </strong>

                  <span>
                    Change time format
                  </span>
                </div>

                <button
                  className={`switch ${
                    hour12 ? "active" : ""
                  }`}
                  onClick={() =>
                    setHour12(!hour12)
                  }
                >
                  <span />
                </button>

              </div>


              <div className="control-row">

                <div>
                  <strong>
                    Show Seconds
                  </strong>

                  <span>
                    Display live seconds
                  </span>
                </div>

                <button
                  className={`switch ${
                    showSeconds ? "active" : ""
                  }`}
                  onClick={() =>
                    setShowSeconds(!showSeconds)
                  }
                >
                  <span />
                </button>

              </div>


              <div className="control-row">

                <div>
                  <strong>
                    Dark Interface
                  </strong>

                  <span>
                    Toggle dashboard theme
                  </span>
                </div>

                <button
                  className={`switch ${
                    darkMode ? "active" : ""
                  }`}
                  onClick={() =>
                    setDarkMode(!darkMode)
                  }
                >
                  <span />
                </button>

              </div>

            </div>


            <div className="timezone-selector">

              <label>
                Primary Time Zone
              </label>

              <select
                value={selectedZone}
                onChange={(event) =>
                  setSelectedZone(
                    event.target.value
                  )
                }
              >

                {timeZones.map((clock) => (
                  <option
                    key={clock.id}
                    value={clock.id}
                  >
                    {clock.flag} {clock.city} —{" "}
                    {clock.country}
                  </option>
                ))}

              </select>

            </div>


            <div className="system-status">

              <div className="status-dot" />

              <div>
                <strong>
                  System Online
                </strong>

                <span>
                  Clock updating every second
                </span>
              </div>

            </div>

          </div>

        </section>


        {/* =========================
            WORLD CLOCKS
        ========================= */}

        <section className="world-section">

          <div className="section-heading world-heading">

            <div>

              <span className="section-icon">
                🌍
              </span>

              <h2>
                World Clocks
              </h2>

            </div>


            <div className="world-actions">

              <select
                value={selectedZone}
                onChange={(event) =>
                  setSelectedZone(
                    event.target.value
                  )
                }
              >

                {timeZones.map((clock) => (
                  <option
                    key={clock.id}
                    value={clock.id}
                  >
                    {clock.flag} {clock.city}
                  </option>
                ))}

              </select>


              <button
                onClick={addWorldClock}
              >
                + Add Clock
              </button>

            </div>

          </div>


          <div className="world-grid">

            {worldClocks.map((clock) => (

              <WorldClock
                key={clock.id}
                clock={clock}
                date={time}
                hour12={hour12}
                showSeconds={showSeconds}
                onRemove={removeWorldClock}
              />

            ))}

          </div>

        </section>


        {/* =========================
            ALARM MANAGER
        ========================= */}

        <section className="alarm-section">

          <div className="section-heading">

            <div>

              <span className="section-icon">
                ⏰
              </span>

              <h2>
                Alarm Manager
              </h2>

            </div>

            <span className="alarm-count">
              {
                alarms.filter(
                  (alarm) => alarm.enabled
                ).length
              } active
            </span>

          </div>


          <form
            className="alarm-form"
            onSubmit={addAlarm}
          >

            <div className="input-group">

              <label>
                Alarm Time
              </label>

              <input
                type="time"
                value={alarmTime}
                onChange={(event) =>
                  setAlarmTime(
                    event.target.value
                  )
                }
                required
              />

            </div>


            <div className="input-group">

              <label>
                Alarm Label
              </label>

              <input
                type="text"
                placeholder="e.g. Wake Up"
                value={alarmLabel}
                onChange={(event) =>
                  setAlarmLabel(
                    event.target.value
                  )
                }
              />

            </div>


            <button
              className="add-alarm-btn"
              type="submit"
            >
              + Add Alarm
            </button>

          </form>


          <div className="alarm-options">

            <span className="current-local">
              Current local time:{" "}
              <strong>
                {time.toLocaleTimeString(
                  "en-GB",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </strong>
            </span>

          </div>


          <div className="alarm-list">

            {alarms.length === 0 ? (

              <div className="empty-state">

                <span>
                  🔔
                </span>

                <p>
                  No alarms set
                </p>

                <small>
                  Create your first alarm above.
                </small>

              </div>

            ) : (

              alarms.map((alarm) => (

                <div
                  className={`alarm-item ${
                    alarm.enabled
                      ? "active"
                      : "disabled"
                  }`}
                  key={alarm.id}
                >

                  <div className="alarm-info">

                    <div className="alarm-time">
                      {alarm.time}
                    </div>

                    <div>

                      <div className="alarm-label">
                        {alarm.label}
                      </div>

                      <div className="alarm-status">
                        {alarm.enabled
                          ? "Alarm enabled"
                          : "Alarm disabled"}
                      </div>

                    </div>

                  </div>


                  <div className="alarm-actions">

                    <button
                      className={`toggle-btn ${
                        alarm.enabled
                          ? "on"
                          : ""
                      }`}
                      type="button"
                      onClick={() =>
                        toggleAlarm(alarm.id)
                      }
                    >
                      {alarm.enabled
                        ? "ON"
                        : "OFF"}
                    </button>


                    <button
                      className="delete-btn"
                      type="button"
                      onClick={() =>
                        deleteAlarm(alarm.id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))

            )}

          </div>

        </section>

      </main>


      {/* FOOTER */}

      <footer>

        <span>
          TIME<span>SYNC</span> • React Real-Time
          Clock Dashboard
        </span>

        <span>
          Live Updates • World Time Zones •
          Alarm Management
        </span>

      </footer>

    </div>
  );
}

export default App;