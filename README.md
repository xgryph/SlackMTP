# Email to Slack Forwarder

This Node.js application acts as an SMTP server that listens for incoming emails and forwards them to a specified Slack channel.

## Features

*   Listens for emails on a specified SMTP port (default: 25).
*   Parses incoming emails (handles both plain text and HTML).
*   Converts HTML email content to plain text for cleaner Slack messages.
*   Forwards emails to a Slack channel using the Slack Web API.
*   Configurable via environment variables.
*   Supports process management with `pm2` for continuous operation.

## Prerequisites

*   **Node.js and npm:** Ensure you have Node.js (version 12 or higher recommended) and npm installed on your system.
*   **Slack App and Bot:**
    *   Create a Slack app at [https://api.slack.com/apps](https://api.slack.com/apps).
    *   Add a bot user to your app.
    *   Enable the following bot token scopes:
        *   `chat:write`
    *   Install the app to your Slack workspace and obtain the **Bot User OAuth Token**.
*   **Root Access (if using port 25):** To listen on the standard SMTP port 25, you will need to run the application with root privileges. Alternatively, you can use a non-privileged port (e.g., 2525) and configure your email server or provider to forward emails to that port.

## Installation

1. **Clone the repository (if applicable):**
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

## Configuration

Configure the application using environment variables. You can set them directly in your terminal or use a `.env` file for development.

### Environment Variables

*   **`SLACK_BOT_TOKEN`:** (Required) Your Slack bot user OAuth token.
*   **`SLACK_DEFAULT_CHANNEL`:** (Optional) The default Slack channel to which emails will be forwarded. Defaults to `#emails`.
*   **`SMTP_PORT`:** (Optional) The port the SMTP server will listen on. Defaults to `25`.

### Using a `.env` file

1. Create a file named `.env` in the project root.
2. Add your environment variables:

    ```
    SLACK_BOT_TOKEN=xoxb-your-bot-token
    SLACK_DEFAULT_CHANNEL=#general
    SMTP_PORT=2525
    ```

3. **Important:** Add `.env` to your `.gitignore` file to prevent accidentally committing your sensitive credentials to version control.

## Running the Application

### Running Directly (Development)

1. Set environment variables (or use a `.env` file).
2. Start the application:

    ```bash
    node index.js
    ```

    If you need to run on port 25:

    ```bash
    sudo node index.js
    ```

### Running with `pm2` (Production)

`pm2` is a process manager that will keep your application running in the background and automatically restart it if it crashes.

1. **Install `pm2` globally:**

    ```bash
    npm install -g pm2
    ```

2. **Start the application with `pm2`:**

    ```bash
    # If not using port 25 and using .env file
    pm2 start index.js --name email-to-slack

    # If using port 25 (requires sudo)
    sudo pm2 start index.js --name email-to-slack --env production
    ```
    The `--env production` flag can be used to tell pm2 to load environment variables for a production environment if you have them configured in your pm2 ecosystem file.

3. **Save the `pm2` process list:** This ensures that `pm2` will automatically restart your application after a server reboot.

    ```bash
    pm2 save
    ```

4. **Setup `pm2` to start on boot (optional but recommended):**

    ```bash
    pm2 startup
    ```

    Follow the instructions provided by the `pm2 startup` command to complete the setup. This usually involves running a generated command with `sudo`.

### `pm2` Commands

*   **List running processes:** `pm2 list`
*   **Stop the application:** `pm2 stop email-to-slack`
*   **Restart the application:** `pm2 restart email-to-slack`
*   **View logs:** `pm2 logs email-to-slack`
*   **Delete the application from `pm2`:** `pm2 delete email-to-slack`

## Testing

You can use command-line tools like `swaks` or `sendmail` to send test emails to your server. Refer to the code comments for examples.

**Example using `swaks`:**

```bash
swaks --to "your_email@your_domain.com" --from "test@example.com" --body "This is a test email." --header "Subject: Test Email" --server "localhost:25"
```

## Security Considerations

* Authentication: If you are running this service on a public server, strongly consider implementing SMTP authentication to prevent unauthorized use.
* TLS/SSL: Use TLS/SSL encryption for secure email transmission.
* Slack Token: Protect your Slack API token. Store it securely as an environment variable and never hardcode it in your code.
* Port 25: Running a service on port 25 requires root privileges, which can pose security risks if not handled carefully. Consider using a different port and configuring email forwarding if possible.

## Customization

* Custom Routing: You can modify the onData function in the code to implement custom routing logic. For example, you could route emails to different Slack channels based on the recipient's email address or keywords in the subject.
* Slack Message Formatting: Customize the slackMessage variable to change the format of the messages sent to Slack. You can use Slack's message formatting options (similar to Markdown) to improve the presentation of the email content.

## Troubleshooting

* Check logs: Use pm2 logs email-to-slack to view the application logs for any errors.
* Verify environment variables: Make sure your environment variables are correctly set.
* Firewall: Ensure that your firewall allows incoming connections on the SMTP port you are using.
* Slack API errors: Check for any errors returned by the Slack API, such as rate limiting or invalid token errors.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
