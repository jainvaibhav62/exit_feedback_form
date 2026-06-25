// ── Vaibhav's Exit Feedback — Google Apps Script ──────────────
//
// SETUP:
//  1. Create a Google Sheet at sheets.google.com
//  2. Copy the Sheet ID from its URL:
//       https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
//  3. Paste that ID as SPREADSHEET_ID below
//  4. Click Run → testSetup() to verify it writes a test row
//  5. Deploy → Manage deployments → create NEW deployment:
//       Type: Web App | Execute as: Me | Access: Anyone
//  6. Copy the /exec URL into script.js and admin.html
//
// ──────────────────────────────────────────────────────────────

const SPREADSHEET_ID = '1gO55qZGOO2emI-iImJsGIDA_OLtfOxevQETXxfRAhsg';

const HEADERS = [
  'Timestamp', 'Name', 'Relationship', 'Worked Together',
  'Working Style', 'Responsiveness', 'Meeting Vibe', 'Impact Score',
  'Archetypes', 'Vaibhav Moment', 'Things Will Miss',
  'Honest Feedback', 'Farewell Message', 'Rehire Score', 'One Word',
];

function getSheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
}

function doPost(e) {
  try {
    const sheet = getSheet();
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
    const sheet   = getSheet();
    const data    = sheet.getDataRange().getValues();

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

// ── Run this manually from the editor to verify your sheet connection ──
function testSetup() {
  const sheet = getSheet();
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  sheet.appendRow([
    new Date().toISOString(), 'TEST USER', 'Direct teammate', '1–3 years',
    'Got things done without making noise about it', 'Replied in reasonable time (model citizen)',
    '5', '9', 'The one who stayed calm when everything was on fire',
    'He fixed a prod bug on a Friday at 5pm without telling anyone.',
    'Having a sounding board who actually listened',
    'Could have promoted his own work more loudly',
    'You raised the bar for what a great colleague looks like.',
    '9', 'Reliable',
  ]);
  Logger.log('✅ Test row written successfully to: ' + sheet.getParent().getName());
}
