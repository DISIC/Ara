export interface AuditCreationEmailData {
  auditorName: string;
  procedureName: string;
  auditUrl: string;
  reportUrl: string;
}

export function subject(data: AuditCreationEmailData): string {
  return `Création d’un nouvel audit : ${data.procedureName}`;
}

export function html(data: AuditCreationEmailData): string {
  return `
    <!DOCTYPE html>
    <html lang="fr" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
      <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
        <meta name="x-apple-disable-message-reformatting">
        <title>Création d'un nouvel audit - ${data.procedureName}</title>
        <!--[if mso]>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
        <![endif]-->
        <style>
          .body,
          .container {
            font-family: sans-serif;
            color: #000;
          }

          h1 {
            font-size: 20px;
            line-height: 24px;
            font-weight: 700;
          }

          a {
            color: #000091;
          }

          p {
            font-size: 14px;
            line-height: 20px;
            margin: 0;
          }
        </style>
      </head>
      <body class="body" style="max-width:600px; margin:0 auto;background:#ffffff;padding:24px;mso-padding-alt:0;" lang="fr">
        <div lang="fr">
          <div style="display: flex; align-items: center;">
            <img src="https://upload.wikimedia.org/wikipedia/fr/thumb/2/22/Republique-francaise-logo.svg/1024px-Republique-francaise-logo.svg.png?20201008150502" style="width: 100px; object-fit: contain; margin-right: 48px;" alt="République Française">
            <!--<div style="margin-right: 48px;">
              République<br />Française
            </div> -->
            <div>
              <p style="font-weight: 700; font-size: 18px; margin-bottom: 12px;">Ara</p>
              <p style="font-size: 14px; margin: 0;">
                Réalisez vos audits d’accessibilité numérique
              </p>
            </div>
          </div>

          <hr style="margin-top: 24px; margin-bottom: 24px; border: none; border-top: 1px solid #E5E5E5;" />

          <h1 style="margin-bottom: 24px;">Bonjour ${data.auditorName},</h1>
          <p style="margin-bottom: 16px;">Vous venez de créer l'audit <strong>${data.procedureName}</strong>.</p>
          <p style="margin-bottom: 12px;">Vous trouverez ci-dessous le lien administrateur de l’audit. Pensez bien à le conserver, c’est le seul moyen de reprendre l’édition de l’audit.</p>

          <div style="background-color: #F5F5FE;padding: 24px; margin-bottom: 24px;">
            <p style="font-size: 20px; font-weight: 700; margin-bottom: 10px;">Lien vers l'audit - ⚠️ Ne pas partager</p>
            <a href="${data.auditUrl}" style="font-size: 16px;">${data.auditUrl}</a>
          </div>

          <p style="margin-bottom: 24px;">Vous trouverez ci-dessous le lien public du rapport d’audit. Il vous permet de consulter et vérifier le rapport d’audit. Vous devrez le partager une fois que l’audit sera terminé.</p>

          <div style="background-color: #F5F5FE;padding: 24px; margin-bottom: 32px;">
            <p style="font-size: 20px; font-weight: 700; margin-bottom: 10px;">Lien vers le rapport - À partager au client</p>
            <a href="${data.reportUrl}" style="font-size: 16px;">${data.reportUrl}</a>
          </div>

          <p style="font-size: 18px; font-weight: 700; margin: 0;">Vous avez une question ?</p>
          <p style="margin-top: 0; margin-bottom: 32px;">Vous pouvez nous contacter en utilisant l’adresse e-mail<br /><strong>ara@design.numerique.gouv.fr</strong>.</p>

          <p style="font-size: 12px; margin-bottom: 0;">Propulsé avec ❤️ par l’équipe <a href="https://design.numerique.gouv.fr/" style="color: #000;">Design des services numériques</a></p>
          <p style="font-size: 10px; color: #666666; margin: 0;">Cet e-mail est envoyé automatiquement, merci de ne pas y répondre.</p>

          <hr style="margin-top: 24px; margin-bottom: 24px; border: none; border-top: 1px solid #E5E5E5;" />

          <img src="https://upload.wikimedia.org/wikipedia/fr/thumb/2/22/Republique-francaise-logo.svg/1024px-Republique-francaise-logo.svg.png?20201008150502" style="width: 100px;" alt="République Française">
        </div>
      </body>
    </html>
  `;
}

export function plain(data: AuditCreationEmailData): string {
  return `
    Bonjour ${data.auditorName}, vous venez de créer l’audit "${data.procedureName}".

    Vous trouverez ci-dessous le lien administrateur de l’audit. Pensez bien à le conserver, c’est le seul moyen de reprendre l’édition de l’audit.
    ${data.auditUrl}

    Vous trouverez ci-dessous le lien public du rapport d’audit. Il vous permet de consulter et vérifier le rapport d’audit. Vous devrez le partager une fois que l’audit sera terminé.
    ${data.reportUrl}

    Vous avez une question ? Vous pouvez nous contacter en utilisant l’adresse e-mail ara@design.numerique.gouv.fr.
  `;
}
