export class FakeEmailService {

    async send(to: string, subject: string) {
        console.log("📧 Fake email sent");

        console.log({
            to,
            subject,
        });
    }
}
