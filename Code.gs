// ── Vaibhav's Exit Feedback — Google Apps Script ──────────────
// Paste this into a new project at https://script.google.com
// then deploy as a Web App (see setup steps in README).
// ──────────────────────────────────────────────────────────────

const HEADERS = [
  'Timestamp', 'Name', 'Relationship', 'Worked Together',
  'Working Style', 'Responsiveness', 'Meeting Vibe', 'Impact Score',
  'Archetypes', 'Vaibhav Moment', 'Things Will Miss',
  'Honest Feedback', 'Farewell Message', 'Rehire Score', 'One Word',
];

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);

    const d = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date().toISOString(),
      d.respondent_name  || 'Anonymous',
      d.relationship     || '',
      d.worked_together  || '',
      d.working_style    || '',
      d.responsiveness   || '',
      d.meeting_vibe     || '',
      d.impact_score     || '',
      (d.archetypes        || []).join(' | '),
      d.vaibhav_moment   || '',
      (d.things_will_miss  || []).join(' | '),
      (d.honest_feedback   || []).join(' | '),
      d.farewell_message || '',
      d.rehire_score     || '',
      d.one_word         || '',
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data  = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return ContentService.createTextOutput('[]').setMimeType(ContentService.MimeType.JSON);
    }

    const headers = data[0];
    const rows    = data.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });

    return ContentService
      .createTextOutput(JSON.stringify(rows))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
