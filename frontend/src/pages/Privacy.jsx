import './Privacy.css';

export default function Privacy() {
  return (
    <div className="privacy-page">
      <div className="privacy-content">
        <h1>Privacy Policy</h1>
        <p className="privacy-updated">Last updated: March 2025</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Gym Admin (&quot;we&quot;, &quot;our&quot;, or &quot;the app&quot;) is a gym management platform that helps gym owners manage members, plans, attendance, and send WhatsApp reminders. This Privacy Policy explains how we collect, use, and protect your information.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <p>We collect information that you provide when using our service:</p>
          <ul>
            <li><strong>Account information:</strong> Gym name, email address, and password when you sign up.</li>
            <li><strong>Member data:</strong> Names, phone numbers, email addresses, plan details, and attendance records that gym admins enter for their members.</li>
            <li><strong>Usage data:</strong> How you use the app (e.g., pages visited, actions taken) to improve our service.</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use the information to:</p>
          <ul>
            <li>Provide and maintain the gym management service.</li>
            <li>Send WhatsApp messages (welcome messages, reminders) to members when authorized by the gym admin.</li>
            <li>Process payments and manage membership plans.</li>
            <li>Improve our app and fix issues.</li>
            <li>Comply with legal obligations.</li>
          </ul>
        </section>

        <section>
          <h2>4. WhatsApp Integration</h2>
          <p>
            We use Meta&apos;s WhatsApp Business API to send messages to members. When a gym admin adds a member and enables WhatsApp notifications, we send messages on behalf of the gym. Message content is controlled by the gym admin. Meta&apos;s privacy policy applies to WhatsApp: <a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">WhatsApp Privacy Policy</a>.
          </p>
        </section>

        <section>
          <h2>5. Data Storage and Security</h2>
          <p>
            Your data is stored on secure servers. We use industry-standard measures to protect your information. Passwords are hashed and never stored in plain text.
          </p>
        </section>

        <section>
          <h2>6. Data Sharing</h2>
          <p>
            We do not sell your data. We may share data with:
          </p>
          <ul>
            <li><strong>Meta/WhatsApp:</strong> To send messages via WhatsApp.</li>
            <li><strong>Hosting providers:</strong> To run our servers (e.g., Render, Vercel).</li>
            <li><strong>Legal authorities:</strong> When required by law.</li>
          </ul>
        </section>

        <section>
          <h2>7. Your Rights</h2>
          <p>You can:</p>
          <ul>
            <li>Access and update your account information.</li>
            <li>Request deletion of your data (see Section 8).</li>
            <li>Opt out of WhatsApp messages by contacting your gym.</li>
          </ul>
        </section>

        <section id="data-deletion">
          <h2>8. How to Delete Your Data</h2>
          <p>
            To request deletion of your data from Gym Admin, follow these steps:
          </p>
          <ol>
            <li>Log in to your Gym Admin account.</li>
            <li>Go to <strong>Settings</strong> and export any data you need.</li>
            <li>Email us at <a href="mailto:blackbeatle1177@gmail.com">blackbeatle1177@gmail.com</a> with the subject line &quot;Data Deletion Request&quot;.</li>
            <li>Include your gym name and the email address associated with your account.</li>
            <li>We will delete your account and all associated data (gym profile, members, plans, attendance, reminder logs) within 30 days.</li>
          </ol>
          <p>
            If you connected our app via Facebook/Meta, you can also remove it from <a href="https://www.facebook.com/settings?tab=applications" target="_blank" rel="noopener noreferrer">Facebook Apps and Websites settings</a> and request data deletion there.
          </p>
        </section>

        <section>
          <h2>9. Contact Us</h2>
          <p>
            For privacy-related questions or data deletion requests, contact us at: <a href="mailto:blackbeatle1177@gmail.com">blackbeatle1177@gmail.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
