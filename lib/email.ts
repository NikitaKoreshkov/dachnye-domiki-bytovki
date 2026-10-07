import nodemailer from 'nodemailer'

export async function sendNewsletterWelcome(email: string) {
  try {
    // В режиме разработки без SMTP просто логируем
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log('\n📧 EMAIL (Dev Mode):')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`To: ${email}`)
      console.log(`Subject: Добро пожаловать в рассылку Дачные-Домики-Бытовки!`)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
      return true
    }

    // Создаем transporter для отправки email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: '🎉 Добро пожаловать в рассылку Дачные-Домики-Бытовки!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                padding: 20px;
              }
              .email-container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: white; 
                border-radius: 20px; 
                overflow: hidden; 
                box-shadow: 0 20px 60px rgba(0,0,0,0.15);
              }
              .header { 
                background: linear-gradient(135deg, #5D4E37 0%, #6D5D4A 50%, #8B7355 100%); 
                color: white; 
                padding: 50px 30px; 
                text-align: center; 
                position: relative; 
                overflow: hidden;
              }
              .header::before { 
                content: ''; 
                position: absolute; 
                top: -50%; 
                left: -50%; 
                width: 200%; 
                height: 200%; 
                background: radial-gradient(circle, rgba(255,255,255,0.1) 2px, transparent 2px); 
                background-size: 30px 30px; 
                opacity: 0.4; 
                animation: float 20s infinite linear;
              }
              @keyframes float {
                0% { transform: translate(0, 0); }
                100% { transform: translate(30px, 30px); }
              }
              .header-content { position: relative; z-index: 1; }
              .header-icon { 
                font-size: 64px; 
                margin-bottom: 20px; 
                display: inline-block;
                animation: bounce 2s infinite;
              }
              @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
              }
              .header h1 { 
                font-size: 42px; 
                font-weight: 900; 
                margin-bottom: 12px; 
                text-shadow: 2px 2px 8px rgba(0,0,0,0.3);
                letter-spacing: -1px;
              }
              .header p { 
                font-size: 20px; 
                opacity: 0.95; 
                font-weight: 300;
              }
              .content { 
                padding: 50px 40px; 
                background: white; 
              }
              .greeting { 
                font-size: 24px; 
                margin-bottom: 25px; 
                color: #111827; 
                font-weight: 700;
                text-align: center;
              }
              .intro { 
                font-size: 18px; 
                color: #4b5563; 
                margin-bottom: 35px; 
                line-height: 1.8;
                text-align: center;
              }
              .benefits-container { 
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                border-radius: 16px; 
                padding: 30px; 
                margin: 35px 0;
                border: 2px solid #fbbf24;
              }
              .benefits-title { 
                font-size: 20px; 
                color: #92400e; 
                font-weight: 700; 
                margin-bottom: 20px;
                text-align: center;
              }
              .benefits-list { 
                list-style: none; 
                padding: 0;
              }
              .benefits-list li { 
                font-size: 16px; 
                color: #78350f; 
                margin-bottom: 15px; 
                padding-left: 35px;
                position: relative;
                line-height: 1.6;
              }
              .benefits-list li::before { 
                content: '✓'; 
                position: absolute; 
                left: 0; 
                font-size: 24px; 
                color: #10b981; 
                font-weight: 900;
                width: 28px;
                height: 28px;
                background: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(16,185,129,0.3);
              }
              .cta-section { 
                background: linear-gradient(135deg, #5D4E37 0%, #6D5D4A 100%);
                border-radius: 16px; 
                padding: 35px; 
                margin: 35px 0; 
                text-align: center;
              }
              .cta-text { 
                font-size: 22px; 
                color: white; 
                font-weight: 700; 
                margin-bottom: 20px;
              }
              .cta-button { 
                display: inline-block; 
                background: white; 
                color: #5D4E37; 
                padding: 16px 40px; 
                border-radius: 12px; 
                text-decoration: none; 
                font-weight: 700; 
                font-size: 18px;
                transition: transform 0.2s, box-shadow 0.2s;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
              }
              .cta-button:hover { 
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0,0,0,0.3);
              }
              .footer { 
                background: #f9fafb; 
                padding: 40px 30px; 
                text-align: center; 
                border-top: 1px solid #e5e7eb; 
              }
              .footer-brand { 
                font-size: 28px; 
                font-weight: 900; 
                color: #5D4E37; 
                margin-bottom: 12px; 
              }
              .footer-text { 
                font-size: 15px; 
                color: #6b7280; 
                margin-bottom: 8px; 
                line-height: 1.6;
              }
              .footer-social { 
                margin: 25px 0; 
                padding: 20px 0;
                border-top: 1px solid #e5e7eb;
                border-bottom: 1px solid #e5e7eb;
              }
              .social-link { 
                display: inline-block; 
                margin: 0 10px; 
                color: #5D4E37; 
                text-decoration: none; 
                font-weight: 600;
              }
              .footer-copyright { 
                font-size: 12px; 
                color: #9ca3af; 
                margin-top: 20px; 
              }
              .divider { 
                height: 2px; 
                background: linear-gradient(90deg, transparent, #d1d5db, transparent); 
                margin: 30px 0; 
              }
              .emoji { font-size: 24px; }
              @media only screen and (max-width: 600px) {
                .header { padding: 40px 20px; }
                .header h1 { font-size: 32px; }
                .header p { font-size: 18px; }
                .content { padding: 35px 25px; }
                .greeting { font-size: 20px; }
                .intro { font-size: 16px; }
                .benefits-container { padding: 25px 20px; }
                .cta-section { padding: 25px 20px; }
                .cta-button { padding: 14px 30px; font-size: 16px; }
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="header">
                <div class="header-content">
                  <div class="header-icon">🏠</div>
                  <h1>Добро пожаловать!</h1>
                  <p>Вы подписались на рассылку Дачные-Домики-Бытовки</p>
                </div>
              </div>
              
              <div class="content">
                <div class="greeting">🎉 Спасибо за подписку!</div>
                
                <div class="intro">
                  Мы очень рады, что вы присоединились к нашему сообществу! Теперь вы будете первыми узнавать о новых проектах, специальных предложениях и акциях.
                </div>
                
                <div class="divider"></div>
                
                <div class="benefits-container">
                  <div class="benefits-title">✨ Что вас ждет:</div>
                  <ul class="benefits-list">
                    <li>Эксклюзивные предложения и акции</li>
                    <li>Новые проекты домов первыми</li>
                    <li>Полезные советы по строительству</li>
                    <li>Специальные цены для подписчиков</li>
                    <li>Анонсы новинок и обновлений</li>
                  </ul>
                </div>
                
                <div class="cta-section">
                  <div class="cta-text">Готовы начать строительство?</div>
                  <a href="https://дачные-домики-бытовки.рф/catalog" class="cta-button">Посмотреть проекты →</a>
                </div>
                
                <div style="font-size: 14px; color: #9ca3af; margin-top: 30px; text-align: center; line-height: 1.6;">
                  Если вы не подписывались на рассылку, просто проигнорируйте это письмо.
                </div>
              </div>
              
              <div class="footer">
                <div class="footer-brand">Дачные-Домики-Бытовки</div>
                <div class="footer-text">Строительство дачных домиков под ключ</div>
                <div class="footer-text">Быстро • Надежно • С гарантией качества</div>
                
                <div class="footer-social">
                  <a href="https://max.ru/u/f9LHodD0cOJ11mRNBmwv4GMET8TQOYXsn4AglpOBhEGg5JpR7w9zmuv4jZ8" class="social-link">💬 MAX</a>
                  <span style="color: #d1d5db;">•</span>
                  <a href="tel:+74950238215" class="social-link">📞 +7 (495) 023-82-15</a>
                </div>
                
                <div class="footer-copyright">
                  © 2025 Дачные-Домики-Бытовки. Все права защищены.<br>
                  Вы получили это письмо, потому что подписались на рассылку на сайте дачные-домики-бытовки.рф
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        Добро пожаловать в рассылку Дачные-Домики-Бытовки!

        Спасибо за подписку! Мы очень рады, что вы присоединились к нашему сообществу.

        Что вас ждет:
        ✓ Эксклюзивные предложения и акции
        ✓ Новые проекты домов первыми
        ✓ Полезные советы по строительству
        ✓ Специальные цены для подписчиков
        ✓ Анонсы новинок и обновлений

        Посмотреть проекты: https://дачные-домики-бытовки.рф/catalog

        Дачные-Домики-Бытовки
        Строительство дачных домиков под ключ
        MAX: https://max.ru/u/f9LHodD0cOJ11mRNBmwv4GMET8TQOYXsn4AglpOBhEGg5JpR7w9zmuv4jZ8
        Телефон: +7 (495) 023-82-15

        © 2025 Дачные-Домики-Бытовки. Все права защищены.
      `,
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Error sending newsletter welcome email:', error)
    return false
  }
}

export async function sendVerificationCode(email: string, code: string, name: string) {
  try {
    // В режиме разработки без SMTP просто логируем код
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log('\n📧 EMAIL (Dev Mode):')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`To: ${email}`)
      console.log(`Subject: Код подтверждения регистрации`)
      console.log(`Код: ${code}`)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
      return true
    }

    // Создаем transporter для отправки email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: '🎁 Добро пожаловать в Дачные-Домики-Бытовки! Код подтверждения',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f7fa; }
              .email-container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%); color: white; padding: 40px 30px; text-align: center; position: relative; overflow: hidden; }
              .header::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 20px 20px; opacity: 0.3; }
              .header h1 { font-size: 36px; font-weight: 900; margin-bottom: 8px; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); position: relative; z-index: 1; }
              .header p { font-size: 18px; opacity: 0.95; position: relative; z-index: 1; }
              .content { padding: 40px 30px; background: white; }
              .greeting { font-size: 18px; margin-bottom: 20px; color: #111827; font-weight: 600; }
              .intro { font-size: 16px; color: #4b5563; margin-bottom: 30px; line-height: 1.8; }
              .code-container { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 3px solid #10b981; border-radius: 16px; padding: 30px; margin: 30px 0; text-align: center; }
              .code-label { font-size: 14px; color: #059669; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; }
              .code { font-size: 48px; font-weight: 900; color: #047857; text-align: center; padding: 20px 0; letter-spacing: 12px; font-family: 'Courier New', monospace; text-shadow: 2px 2px 8px rgba(16,185,129,0.2); }
              .warning { background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-left: 5px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 12px; display: flex; align-items: center; gap: 12px; }
              .warning-icon { font-size: 24px; }
              .warning-text { font-size: 15px; color: #92400e; font-weight: 600; }
              .info { font-size: 15px; color: #6b7280; margin: 30px 0 20px 0; line-height: 1.8; }
              .footer { background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
              .footer-brand { font-size: 20px; font-weight: 700; color: #10b981; margin-bottom: 8px; }
              .footer-text { font-size: 14px; color: #6b7280; margin-bottom: 4px; }
              .footer-copyright { font-size: 12px; color: #9ca3af; margin-top: 15px; }
              .divider { height: 1px; background: linear-gradient(90deg, transparent, #d1d5db, transparent); margin: 25px 0; }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="header">
                <h1>🏠 Дачные-Домики-Бытовки</h1>
                <p>Ваш дом мечты начинается здесь</p>
              </div>
              
              <div class="content">
                <div class="greeting">Здравствуйте, ${name}!</div>
                
                <div class="intro">
                  Спасибо за регистрацию на нашем сайте! Мы рады приветствовать вас в сообществе <strong>Дачные-Домики-Бытовки</strong>.
                </div>
                
                <div class="divider"></div>
                
                <div class="code-container">
                  <div class="code-label">Ваш код подтверждения</div>
                  <div class="code">${code}</div>
                </div>
                
                <div class="warning">
                  <span class="warning-icon">⏱️</span>
                  <span class="warning-text">Код действителен только в течение 15 минут</span>
                </div>
                
                <div class="info">
                  После ввода кода вы сможете пользоваться всеми возможностями личного кабинета: сохранять избранные проекты, рассчитать стоимость дома и многое другое!
                </div>
                
                <div class="info" style="font-size: 13px; color: #9ca3af; margin-top: 20px;">
                  Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.
                </div>
              </div>
              
              <div class="footer">
                <div class="footer-brand">Дачные-Домики-Бытовки</div>
                <div class="footer-text">Строительство дачных домиков под ключ</div>
                <div class="footer-text">Москва, Россия</div>
                <div class="footer-copyright">© 2024 Дачные-Домики-Бытовки. Все права защищены.</div>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        Дачные-Домики-Бытовки - Код подтверждения
        
        Здравствуйте, ${name}!
        
        Ваш код подтверждения: ${code}
        
        Код действителен в течение 15 минут.
        
        Если вы не регистрировались на нашем сайте, проигнорируйте это письмо.
        
        Дачные-Домики-Бытовки © 2024
      `,
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

export async function sendCallbackRequest(name: string, phone: string) {
  // ВРЕМЕННО: для диагностики просто логируем и возвращаем true
  // Это поможет проверить, вызывается ли функция вообще
  console.error('\n\n[EMAIL ERROR LOG] ==========================================')
  console.error('[EMAIL ERROR LOG] FUNCTION CALLED - sendCallbackRequest')
  console.error(`[EMAIL ERROR LOG] Name: ${name}`)
  console.error(`[EMAIL ERROR LOG] Phone: ${phone}`)
  console.error('[EMAIL ERROR LOG] ==========================================\n\n')
  
  try {
    // Отправляем на jafardom25@gmail.com
    const recipientEmail = 'jafardom25@gmail.com'
    
    console.log(`[EMAIL] ==========================================`)
    console.log(`[EMAIL] Starting sendCallbackRequest`)
    console.log(`[EMAIL] Name: ${name}`)
    console.log(`[EMAIL] Phone: ${phone}`)
    console.log(`[EMAIL] Recipient: ${recipientEmail}`)
    console.log(`[EMAIL] ==========================================`)
    
    // Используем Gmail SMTP напрямую с App Password
    // Возвращаемся к jafardom25@gmail.com с новым паролем
    const gmailUser = 'jafardom25@gmail.com'
    // App Password из .env или используем по умолчанию
    // Пароль: mqkf nzen wwhq abmt (без пробелов: mqkfnzenwwhqabmt)
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD || 'mqkfnzenwwhqabmt'
    const cleanPassword = gmailAppPassword.replace(/\s/g, '').trim()
    
    console.log(`[EMAIL] Using Gmail SMTP: ${gmailUser}`)
    console.log(`[EMAIL] Password (first 4 chars): ${cleanPassword.substring(0, 4)}***`)
    console.log(`[EMAIL] Password length: ${cleanPassword.length} (should be 16)`)
    console.log(`[EMAIL] GMAIL_APP_PASSWORD from env: ${!!process.env.GMAIL_APP_PASSWORD}`)
    
    // Проверяем валидность пароля
    if (cleanPassword.length !== 16) {
      console.error(`[EMAIL] ❌ Invalid password length: ${cleanPassword.length}, expected 16`)
      throw new Error(`Invalid Gmail App Password length: ${cleanPassword.length}`)
    }
    
    // Создаем Gmail transporter с простой конфигурацией
    const gmailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: cleanPassword
      }
    })
    
    console.log('[EMAIL] Gmail transporter created successfully')
    
    const mailOptions = {
      from: `"Дачные-Домики-Бытовки" <${gmailUser}>`,
      to: recipientEmail,
      subject: '📞 Заявка на обратный звонок - Дачные-Домики-Бытовки',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .email-container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #5D4E37 0%, #6D5D4A 100%); color: white; padding: 40px 30px; text-align: center; }
              .header h1 { font-size: 36px; font-weight: 900; }
              .content { padding: 40px 30px; }
              .info-block { background: #f9fafb; border-left: 4px solid #5D4E37; padding: 20px; margin: 20px 0; border-radius: 8px; }
              .info-label { font-size: 14px; color: #6b7280; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; }
              .info-value { font-size: 18px; color: #111827; font-weight: 700; }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="header">
                <h1>📞 Заявка на обратный звонок</h1>
                <p>Новая заявка с сайта Дачные-Домики-Бытовки</p>
              </div>
              <div class="content">
                <div class="info-block">
                  <div class="info-label">Имя клиента</div>
                  <div class="info-value">${name}</div>
                </div>
                <div class="info-block">
                  <div class="info-label">Номер телефона</div>
                  <div class="info-value">${phone}</div>
                </div>
                <p style="margin-top: 30px; color: #6b7280;">
                  Пожалуйста, свяжитесь с клиентом как можно скорее.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `Заявка на обратный звонок - Дачные-Домики-Бытовки\n\nИмя: ${name}\nТелефон: ${phone}\n\nПожалуйста, свяжитесь с клиентом как можно скорее.`,
    }

    console.log('[EMAIL] Sending email...')
    console.log('[EMAIL] Mail options prepared, attempting send...')
    
    try {
      const result = await gmailTransporter.sendMail(mailOptions)
      console.log(`[EMAIL] ✅ Email sent successfully!`)
      console.log(`[EMAIL] MessageId: ${result.messageId}`)
      console.log(`[EMAIL] Response: ${result.response}`)
      console.log(`[EMAIL] ==========================================`)
      return true
    } catch (sendError: any) {
      console.error('[EMAIL] ❌ sendMail() error:', sendError)
      console.error('[EMAIL] Error code:', sendError.code)
      console.error('[EMAIL] Error message:', sendError.message)
      console.error('[EMAIL] Error command:', sendError.command)
      console.error('[EMAIL] Error response:', sendError.response)
      throw sendError // Пробрасываем дальше
    }
    
  } catch (error: any) {
    console.error('[EMAIL] ❌ Error sending email:', error)
    console.error('[EMAIL] Error type:', typeof error)
    console.error('[EMAIL] Error code:', error?.code)
    console.error('[EMAIL] Error message:', error?.message)
    if (error?.response) {
      console.error('[EMAIL] Error response:', error.response)
    }
    if (error?.responseCode) {
      console.error('[EMAIL] Error responseCode:', error.responseCode)
    }
    if (error?.stack) {
      console.error('[EMAIL] Error stack:', error.stack.substring(0, 500))
    }
    console.log(`[EMAIL] ==========================================`)
    
    // В случае ошибки логируем данные для ручной обработки
    console.log('\n📧 CALLBACK REQUEST DATA (Fallback):')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`To: jafardom25@gmail.com`)
    console.log(`Subject: Заявка на обратный звонок`)
    console.log(`Имя: ${name}`)
    console.log(`Телефон: ${phone}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    return false
  }
}

export async function sendContactFormRequest(name: string, phone: string, message?: string) {
  try {
    const recipientEmail = 'jafardom25@gmail.com'
    const gmailUser = 'jafardom25@gmail.com'
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD || 'mqkfnzenwwhqabmt'
    const cleanPassword = gmailAppPassword.replace(/\s/g, '').trim()
    
    if (cleanPassword.length !== 16) {
      throw new Error(`Invalid Gmail App Password length: ${cleanPassword.length}`)
    }
    
    const gmailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: cleanPassword
      }
    })
    
    const mailOptions = {
      from: `"Дачные-Домики-Бытовки" <${gmailUser}>`,
      to: recipientEmail,
      subject: '📝 Заявка с контактной формы - Дачные-Домики-Бытовки',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .email-container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #5D4E37 0%, #6D5D4A 100%); color: white; padding: 40px 30px; text-align: center; }
              .header h1 { font-size: 36px; font-weight: 900; }
              .content { padding: 40px 30px; }
              .info-block { background: #f9fafb; border-left: 4px solid #5D4E37; padding: 20px; margin: 20px 0; border-radius: 8px; }
              .info-label { font-size: 14px; color: #6b7280; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; }
              .info-value { font-size: 18px; color: #111827; font-weight: 700; }
              .message-block { background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px; }
              .message-text { font-size: 16px; color: #111827; white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="header">
                <h1>📝 Заявка с контактной формы</h1>
                <p>Новая заявка с сайта Дачные-Домики-Бытовки</p>
              </div>
              <div class="content">
                <div class="info-block">
                  <div class="info-label">Имя клиента</div>
                  <div class="info-value">${name}</div>
                </div>
                <div class="info-block">
                  <div class="info-label">Номер телефона</div>
                  <div class="info-value">${phone}</div>
                </div>
                ${message ? `
                <div class="message-block">
                  <div class="info-label">Сообщение</div>
                  <div class="message-text">${message}</div>
                </div>
                ` : ''}
                <p style="margin-top: 30px; color: #6b7280;">
                  Пожалуйста, свяжитесь с клиентом как можно скорее.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `Заявка с контактной формы - Дачные-Домики-Бытовки\n\nИмя: ${name}\nТелефон: ${phone}${message ? `\nСообщение: ${message}` : ''}\n\nПожалуйста, свяжитесь с клиентом как можно скорее.`,
    }
    
    const result = await gmailTransporter.sendMail(mailOptions)
    console.log(`[EMAIL] ✅ Contact form email sent successfully!`)
    return true
  } catch (error: any) {
    console.error('[EMAIL] ❌ Error sending contact form email:', error)
    return false
  }
}

export async function sendCalculatorRequest(message: string, phone: string, params?: any) {
  try {
    const recipientEmail = 'jafardom25@gmail.com'
    const gmailUser = 'jafardom25@gmail.com'
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD || 'mqkfnzenwwhqabmt'
    const cleanPassword = gmailAppPassword.replace(/\s/g, '').trim()
    
    if (cleanPassword.length !== 16) {
      throw new Error(`Invalid Gmail App Password length: ${cleanPassword.length}`)
    }
    
    const gmailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: cleanPassword
      }
    })
    
    const paramsText = params ? `
      <div class="info-block">
        <div class="info-label">Параметры расчета</div>
        <div class="message-text">${JSON.stringify(params, null, 2)}</div>
      </div>
    ` : ''
    
    const mailOptions = {
      from: `"Дачные-Домики-Бытовки" <${gmailUser}>`,
      to: recipientEmail,
      subject: '💰 Заявка из калькулятора - Дачные-Домики-Бытовки',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .email-container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #5D4E37 0%, #6D5D4A 100%); color: white; padding: 40px 30px; text-align: center; }
              .header h1 { font-size: 36px; font-weight: 900; }
              .content { padding: 40px 30px; }
              .info-block { background: #f9fafb; border-left: 4px solid #5D4E37; padding: 20px; margin: 20px 0; border-radius: 8px; }
              .info-label { font-size: 14px; color: #6b7280; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; }
              .info-value { font-size: 18px; color: #111827; font-weight: 700; }
              .message-text { font-size: 16px; color: #111827; white-space: pre-wrap; font-family: monospace; }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="header">
                <h1>💰 Заявка из калькулятора</h1>
                <p>Новая заявка с сайта Дачные-Домики-Бытовки</p>
              </div>
              <div class="content">
                <div class="info-block">
                  <div class="info-label">Номер телефона</div>
                  <div class="info-value">${phone}</div>
                </div>
                <div class="info-block">
                  <div class="info-label">Детали расчета</div>
                  <div class="message-text">${message.replace(/\n/g, '<br>')}</div>
                </div>
                ${paramsText}
                <p style="margin-top: 30px; color: #6b7280;">
                  Пожалуйста, свяжитесь с клиентом как можно скорее.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `Заявка из калькулятора - Дачные-Домики-Бытовки\n\nНомер телефона: ${phone}\n\n${message}${params ? `\n\nПараметры:\n${JSON.stringify(params, null, 2)}` : ''}\n\nПожалуйста, свяжитесь с клиентом как можно скорее.`,
    }
    
    const result = await gmailTransporter.sendMail(mailOptions)
    console.log(`[EMAIL] ✅ Calculator request email sent successfully!`)
    return true
  } catch (error: any) {
    console.error('[EMAIL] ❌ Error sending calculator request email:', error)
    return false
  }
}

export async function sendProjectRequest(phone: string, projectTitle: string, projectId: string, projectData?: any) {
  try {
    const recipientEmail = 'jafardom25@gmail.com'
    const gmailUser = 'jafardom25@gmail.com'
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD || 'mqkfnzenwwhqabmt'
    const cleanPassword = gmailAppPassword.replace(/\s/g, '').trim()
    
    if (cleanPassword.length !== 16) {
      throw new Error(`Invalid Gmail App Password length: ${cleanPassword.length}`)
    }
    
    const gmailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: cleanPassword
      }
    })
    
    const projectInfoText = projectData ? `
      <div class="info-block">
        <div class="info-label">Информация о проекте</div>
        <div class="message-text">Площадь: ${projectData.area || 'н/д'} м²<br>Регион: ${projectData.region || 'н/д'}<br>Стоимость: ${projectData.priceFrom ? `от ${projectData.priceFrom.toLocaleString('ru-RU')} руб.` : 'н/д'}</div>
      </div>
    ` : ''
    
    const mailOptions = {
      from: `"Дачные-Домики-Бытовки" <${gmailUser}>`,
      to: recipientEmail,
      subject: `🏠 Заявка на проект: ${projectTitle} - Дачные-Домики-Бытовки`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .email-container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #5D4E37 0%, #6D5D4A 100%); color: white; padding: 40px 30px; text-align: center; }
              .header h1 { font-size: 36px; font-weight: 900; }
              .content { padding: 40px 30px; }
              .info-block { background: #f9fafb; border-left: 4px solid #5D4E37; padding: 20px; margin: 20px 0; border-radius: 8px; }
              .info-label { font-size: 14px; color: #6b7280; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; }
              .info-value { font-size: 18px; color: #111827; font-weight: 700; }
              .message-text { font-size: 16px; color: #111827; }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="header">
                <h1>🏠 Заявка на проект</h1>
                <p>Новая заявка с сайта Дачные-Домики-Бытовки</p>
              </div>
              <div class="content">
                <div class="info-block">
                  <div class="info-label">Номер телефона</div>
                  <div class="info-value">${phone}</div>
                </div>
                <div class="info-block">
                  <div class="info-label">Название проекта</div>
                  <div class="info-value">${projectTitle}</div>
                </div>
                <div class="info-block">
                  <div class="info-label">ID проекта</div>
                  <div class="info-value">${projectId}</div>
                </div>
                ${projectInfoText}
                <p style="margin-top: 30px; color: #6b7280;">
                  Пожалуйста, свяжитесь с клиентом как можно скорее.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `Заявка на проект - Дачные-Домики-Бытовки\n\nНомер телефона: ${phone}\nНазвание проекта: ${projectTitle}\nID проекта: ${projectId}${projectData ? `\n\nПлощадь: ${projectData.area || 'н/д'} м²\nРегион: ${projectData.region || 'н/д'}\nСтоимость: ${projectData.priceFrom ? `от ${projectData.priceFrom.toLocaleString('ru-RU')} руб.` : 'н/д'}` : ''}\n\nПожалуйста, свяжитесь с клиентом как можно скорее.`,
    }
    
    const result = await gmailTransporter.sendMail(mailOptions)
    console.log(`[EMAIL] ✅ Project request email sent successfully!`)
    return true
  } catch (error: any) {
    console.error('[EMAIL] ❌ Error sending project request email:', error)
    return false
  }
}
