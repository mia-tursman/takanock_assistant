export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const { messages, system, model, max_tokens, airtable_record, table } = req.body;

  if (airtable_record) {
    let baseId, tableId, fields;

    if (table === 'it') {
      baseId = 'appvNDBoDDGFshd5J';
      tableId = 'tblVudrEioL0al0co';
      fields = {
        'Submitter Name': airtable_record.name || '',
        'Submitter Email': airtable_record.email || '',
        'Department': airtable_record.department || '',
        'Request Type': airtable_record.requestType || '',
        'Request Description': airtable_record.description || '',
        'Urgency': airtable_record.urgency || '',
        'Input Channel': 'Web App',
        'Status': 'New',
        'Submitted At': new Date().toISOString()
      };
    } else if (table === 'automation') {
      baseId = 'appH6AVn2QYaMV2Uo';
      tableId = 'tblfqTJvzI7IW7OiN';
      fields = {
        'Title': airtable_record.title || '',
        'Submitter Name': airtable_record.name || '',
        'Submitter Email': airtable_record.email || '',
        'Department': airtable_record.department || '',
        'Description': airtable_record.description || '',
        'Business Problem': airtable_record.businessProblem || '',
        'Current Process': airtable_record.currentProcess || '',
        'Submitter Priority': airtable_record.priority || '',
        'Submitted Date': new Date().toISOString().split('T')[0]
      };
    } else {
      return res.status(400).json({ error: 'Unknown table' });
    }

    const atRes = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`
      },
      body: JSON.stringify({ records: [{ fields }] })
    });

    const atData = await atRes.json();
    return res.status(atRes.status).json(atData);
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({ messages, system, model, max_tokens })
  });

  const data = await response.json();
  res.status(response.status).json(data);
}
