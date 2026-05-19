// lib/tz.js
// Single source of truth for "today" and date-string formatting in the
// business timezone (America/New_York). Loaded by index.html, manage.html,
// and admin.html as a plain <script>.
//
// All helpers operate on YYYY-MM-DD strings anchored at noon UTC, which
// always sits inside the same ET business day (UTC-5 or UTC-4 depending on
// DST). This avoids local-browser drift and DST edge cases for whole-day
// offsets.
(function (g) {
  var TZ = "America/New_York";

  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  // Y-M-D-H-M parts of a Date as observed in the business timezone.
  function bizParts(d) {
    var p = new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false
    }).formatToParts(d);
    var o = {};
    for (var i = 0; i < p.length; i++) {
      if (p[i].type !== "literal") o[p[i].type] = p[i].value;
    }
    return o;
  }

  // YYYY-MM-DD for the given Date (default: now) in the business timezone.
  function todayStr(d) {
    var p = bizParts(d || new Date());
    return p.year + "-" + p.month + "-" + p.day;
  }

  // Treat YYYY-MM-DD as "noon UTC on that date." Inside the ET business day
  // year-round, so subsequent date arithmetic is DST-safe for whole days.
  function anchorUTC(yyyyMmDd) {
    return new Date(yyyyMmDd + "T12:00:00Z");
  }

  // Add whole days to a YYYY-MM-DD; return YYYY-MM-DD in business timezone.
  function addDays(yyyyMmDd, days) {
    var d = anchorUTC(yyyyMmDd);
    d.setUTCDate(d.getUTCDate() + days);
    return todayStr(d);
  }

  // 0=Sun..6=Sat for a YYYY-MM-DD as observed in the business timezone.
  function weekdayIndex(yyyyMmDd) {
    var w = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ, weekday: "short"
    }).format(anchorUTC(yyyyMmDd));
    return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(w);
  }

  // Long human label, e.g. "Monday, May 18, 2026", in business timezone.
  function formatLong(yyyyMmDd) {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    }).format(anchorUTC(yyyyMmDd));
  }

  // Short human label, e.g. "Mon, May 18".
  function formatShort(yyyyMmDd) {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      weekday: "short", month: "short", day: "numeric"
    }).format(anchorUTC(yyyyMmDd));
  }

  // [sundayYMD, saturdayYMD] for the week containing today (business TZ).
  function weekBounds() {
    var today = todayStr();
    var w = weekdayIndex(today);
    return [addDays(today, -w), addDays(today, 6 - w)];
  }

  // [firstYMD, lastYMD] for the month containing today (business TZ).
  function monthBounds() {
    var today = todayStr();
    var parts = today.split("-");
    var first = parts[0] + "-" + parts[1] + "-01";
    var nextMonth = parseInt(parts[1], 10) + 1;
    var year = parseInt(parts[0], 10);
    if (nextMonth > 12) { nextMonth = 1; year += 1; }
    var firstOfNext = year + "-" + pad2(nextMonth) + "-01";
    var last = addDays(firstOfNext, -1);
    return [first, last];
  }

  // Calendar grid helpers (timezone-agnostic, anchored on UTC math).
  function daysInMonth(year, month0) {
    return new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();
  }
  function firstWeekdayOfMonth(year, month0) {
    return new Date(Date.UTC(year, month0, 1)).getUTCDay();
  }
  function ymdFromYM(year, month0, day) {
    return year + "-" + pad2(month0 + 1) + "-" + pad2(day);
  }
  // Y-M0 of "today" in business TZ for calendar initialization.
  function todayYearMonth() {
    var t = todayStr().split("-");
    return { year: parseInt(t[0], 10), month0: parseInt(t[1], 10) - 1 };
  }

  // Convert an ET wall-clock moment (year, month0, day, hour, minute) to
  // a UTC timestamp in ms. Uses a two-pass offset solve so DST transition
  // days are correct.
  function etWallMs(year, month0, day, hour, minute) {
    var naive = Date.UTC(year, month0, day, hour, minute);
    function offsetAt(utcMs) {
      var p = bizParts(new Date(utcMs));
      var etAsUtc = Date.UTC(
        parseInt(p.year, 10),
        parseInt(p.month, 10) - 1,
        parseInt(p.day, 10),
        parseInt(p.hour, 10),
        parseInt(p.minute, 10)
      );
      return etAsUtc - utcMs; // ms offset of ET vs UTC at that instant
    }
    var off = offsetAt(naive);
    var first = naive - off;
    var off2 = offsetAt(first);
    return naive - off2;
  }

  // Parse a slot string like "1:00 PM – 2:00 PM" (en dash) and return
  // [hour24, minute] for its start.
  function parseSlotStart(timeStr) {
    var startPart = timeStr.split("–")[0].trim();
    var parts = startPart.split(" ");
    var hm = parts[0].split(":");
    var h = parseInt(hm[0], 10);
    var m = hm[1] ? parseInt(hm[1], 10) : 0;
    var ampm = (parts[1] || "").toUpperCase();
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return [h, m];
  }

  // ms timestamp for the start of a booked slot, interpreted in business TZ.
  function bookingStartMs(yyyyMmDd, slotStr) {
    var ymd = yyyyMmDd.split("-").map(function (s) { return parseInt(s, 10); });
    var hm = parseSlotStart(slotStr);
    return etWallMs(ymd[0], ymd[1] - 1, ymd[2], hm[0], hm[1]);
  }

  // True if a slot is unavailable for *customer* booking because its
  // start hour is in the past or the current hour in business TZ.
  // The current hour is reserved for staff walk-ins (admin flow), so
  // self-serve customers cannot book it.
  function customerSlotUnavailable(yyyyMmDd, slotStr) {
    var today = todayStr();
    if (yyyyMmDd < today) return true;
    if (yyyyMmDd > today) return false;
    var hm = parseSlotStart(slotStr);
    var nowH = parseInt(bizParts(new Date()).hour, 10);
    return hm[0] <= nowH;
  }

  g.TT_TZ = {
    TZ: TZ,
    todayStr: todayStr,
    addDays: addDays,
    weekdayIndex: weekdayIndex,
    formatLong: formatLong,
    formatShort: formatShort,
    weekBounds: weekBounds,
    monthBounds: monthBounds,
    daysInMonth: daysInMonth,
    firstWeekdayOfMonth: firstWeekdayOfMonth,
    ymdFromYM: ymdFromYM,
    todayYearMonth: todayYearMonth,
    bizHourNow: function () { return parseInt(bizParts(new Date()).hour, 10); },
    bookingStartMs: bookingStartMs,
    parseSlotStart: parseSlotStart,
    etWallMs: etWallMs,
    customerSlotUnavailable: customerSlotUnavailable
  };
})(window);
