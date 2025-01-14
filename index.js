const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');
const { WebClient } = require('@slack/web-api');
const { htmlToText } = require('html-to-text');

// Load environment variables (consider using dotenv)
const slackToken = process.env.SLACK_BOT_TOKEN;
const defaultSlackChannel = process.env.SLACK_DEFAULT_CHANNEL || '#emails'; // Default if not set

// Initialize Slack client
const slack = new WebClient(slackToken);

// SMTP Server Options
const options = {
	onData(stream, session, callback) {
		simpleParser(stream, {}, (err, parsed) => {
			if (err) {
				console.error('Error parsing email:', err);
				return callback(err);
			}

			// Extract relevant email data
			const from = parsed.from.text;
			const to = parsed.to.text;
			const subject = parsed.subject;
			const body = parsed.text || htmlToText(parsed.html);

			// Format message for Slack
			const slackMessage = `
*New email received!*
*From:* ${from}
*To:* ${to}
*Subject:* ${subject}
*Body:*
${body}
      `;

			// Send to Slack
			slack.chat.postMessage({
					channel: defaultSlackChannel, // Or determine channel based on 'to'
					text: slackMessage,
				})
				.then(() => {
					console.log('Email forwarded to Slack!');
					callback(); // Acknowledge email received
				})
				.catch((slackErr) => {
					console.error('Error sending to Slack:', slackErr);
					callback(slackErr);
				});
		});
	},
	disabledCommands: ['AUTH'], // Consider allowing authentication for security
};

// Create SMTP server
const server = new SMTPServer(options);

server.on('error', (err) => {
	console.error('SMTP Server Error:', err);
});

// Start listening
const port = process.env.SMTP_PORT || 25;
server.listen(port, () => {
	console.log(`SMTP server listening on port ${port}`);
});