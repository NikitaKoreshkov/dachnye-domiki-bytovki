import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const getContractHTML = (companyName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      padding: 50px;
      color: #000;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    .header h1 {
      font-size: 20pt;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .header h2 {
      font-size: 14pt;
      margin-bottom: 20px;
    }
    .date {
      text-align: right;
      font-size: 10pt;
      margin-bottom: 20px;
    }
    .section {
      margin-bottom: 15px;
    }
    .section-title {
      font-size: 12pt;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .text {
      font-size: 10pt;
      text-align: justify;
      margin-bottom: 5px;
    }
    .text-bold {
      font-size: 10pt;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .list-item {
      font-size: 10pt;
      margin-left: 20px;
      margin-bottom: 3px;
    }
    .signature-block {
      margin-top: 30px;
      margin-bottom: 15px;
    }
    .signature-label {
      font-size: 11pt;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .footer {
      margin-top: 30px;
      font-size: 8pt;
      color: #666;
      text-align: center;
    }
    @media print {
      body {
        padding: 20mm;
      }
      .page-break {
        page-break-before: always;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>ДОГОВОР ПОДРЯДА</h1>
    <h2>на выполнение работ по строительству каркасного дома</h2>
  </div>

  <div class="date">
    г. Москва<br>
    «__» __________ 2025 г.
  </div>

  <div class="section">
    <div class="text-bold">Индивидуальный предприниматель ГЮЛЬАХМЕДОВ АТАЙ ЭДИСОНОВИЧ</div>
    <div class="text">ИНН: 055000493170</div>
    <div class="text">Юридический адрес: 108811, РОССИЯ, Г МОСКВА, МОСКОВСКИЙ П,</div>
    <div class="text">УЛ КАРТМАЗОВСКИЕ ПРУДЫ, Д 2, КОРП 3. КВ 474</div>
    <div class="text">Телефон: +7 (495) 023-82-15</div>
    <div class="text">именуемый в дальнейшем «Подрядчик», с одной стороны,</div>
  </div>

  <div class="section">
    <div class="text-bold">Гражданин (ка) Российской Федерации</div>
    <div class="text">Паспорт: серия ______ № ______________</div>
    <div class="text">Выдан: _________________________________________________</div>
    <div class="text">Дата выдачи: ______________</div>
    <div class="text">Адрес регистрации: _____________________________________</div>
    <div class="text">именуемый(ая) в дальнейшем «Заказчик», с другой стороны,</div>
  </div>

  <div class="section">
    <div class="text">совместно именуемые «Стороны», заключили настоящий Договор подряда (далее — «Договор») о нижеследующем:</div>
  </div>

  <div class="section">
    <div class="section-title">1. ПРЕДМЕТ ДОГОВОРА</div>
    <div class="text">1.1. Подрядчик обязуется выполнить своими силами и средствами работы по строительству каркасного дома (далее — «Объект»), а Заказчик обязуется принять выполненные работы и оплатить их стоимость в порядке и сроки, установленные настоящим Договором.</div>
    <div class="text">1.2. Технические характеристики Объекта:</div>
    <div class="list-item">— Проект: __________________________________________________</div>
    <div class="list-item">— Площадь: __________ кв.м.</div>
    <div class="list-item">— Размеры: __________ м × __________ м</div>
    <div class="list-item">— Этажность: __________</div>
    <div class="list-item">— Адрес строительства: ____________________________________</div>
    <div class="text">1.3. Подрядчик выполняет следующие виды работ:</div>
    <div class="list-item">— Изготовление каркаса дома на производстве</div>
    <div class="list-item">— Доставка материалов и конструкций на объект</div>
    <div class="list-item">— Монтаж каркаса и сборка дома</div>
    <div class="list-item">— Утепление и гидроизоляция</div>
    <div class="list-item">— Устройство кровли</div>
    <div class="list-item">— Монтаж окон и дверей</div>
    <div class="list-item">— Внутренняя отделка (согласно спецификации)</div>
    <div class="list-item">— Подключение инженерных систем (при наличии)</div>
  </div>

  <div class="section page-break">
    <div class="section-title">2. СТОИМОСТЬ РАБОТ И ПОРЯДОК РАСЧЕТОВ</div>
    <div class="text">2.1. Общая стоимость работ по настоящему Договору составляет:</div>
    <div class="text-bold" style="margin-left: 20px;">______________________________ рублей (__________________) рублей 00 копеек.</div>
    <div class="text">2.2. Стоимость работ включает в себя стоимость материалов, работ, транспортных расходов, налогов и сборов, подлежащих уплате в соответствии с законодательством Российской Федерации.</div>
    <div class="text">2.3. Детальная смета на выполнение работ является неотъемлемой частью настоящего Договора (Приложение № 1).</div>
    <div class="text">2.4. Порядок оплаты:</div>
    <div class="list-item">— Предоплата при подписании Договора: 50% от общей стоимости — _______________ рублей</div>
    <div class="list-item">— Оплата после доставки материалов: 30% от общей стоимости — _______________ рублей</div>
    <div class="list-item">— Оплата после завершения монтажа: 15% от общей стоимости — _______________ рублей</div>
    <div class="list-item">— Оплата после завершения работ и подписания акта приема-передачи: 5% от общей стоимости — _______________ рублей</div>
    <div class="text">2.5. Расчеты между Сторонами производятся путем перечисления денежных средств на расчетный счет Подрядчика, указанный в настоящем Договоре.</div>
  </div>

  <div class="section">
    <div class="section-title">3. СРОКИ ВЫПОЛНЕНИЯ РАБОТ</div>
    <div class="text">3.1. Срок начала выполнения работ: «__» __________ 2025 г.</div>
    <div class="text">3.2. Срок окончания выполнения работ: «__» __________ 2025 г.</div>
    <div class="text">3.3. Общий срок выполнения работ составляет: ______________ календарных дней с момента начала выполнения работ.</div>
    <div class="text">3.4. В случае нарушения сроков выполнения работ по вине Заказчика (несвоевременная оплата, непредоставление доступа на объект и т.д.) сроки выполнения работ продлеваются на период такого нарушения.</div>
  </div>

  <div class="section">
    <div class="section-title">4. ТРЕБОВАНИЯ К КАЧЕСТВУ РАБОТ</div>
    <div class="text">4.1. Качество выполняемых работ должно соответствовать:</div>
    <div class="list-item">— Градостроительному кодексу Российской Федерации</div>
    <div class="list-item">— Федеральному закону от 30.12.2009 № 384-ФЗ «Технический регламент о безопасности зданий и сооружений»</div>
    <div class="list-item">— Федеральному закону от 22.07.2008 № 123-ФЗ «Технический регламент о требованиях пожарной безопасности»</div>
    <div class="list-item">— СНиП 31-105-2002 «Проектирование и строительство энергоэффективных одноквартирных жилых домов с деревянным каркасом»</div>
    <div class="list-item">— СП 64.13330.2017 «Деревянные конструкции»</div>
    <div class="list-item">— Иным действующим строительным нормам и правилам Российской Федерации</div>
    <div class="text">4.2. Все используемые материалы должны иметь сертификаты соответствия и документы, подтверждающие их происхождение и качество.</div>
    <div class="text">4.3. Работы должны выполняться с использованием материалов, согласованных Сторонами в смете.</div>
  </div>

  <div class="section page-break">
    <div class="section-title">5. ОБЯЗАННОСТИ СТОРОН</div>
    <div class="text-bold">5.1. Подрядчик обязуется:</div>
    <div class="list-item">— Выполнить работы в соответствии с условиями настоящего Договора и утвержденным проектом</div>
    <div class="list-item">— Использовать материалы, соответствующие требованиям технических регламентов</div>
    <div class="list-item">— Соблюдать технологию производства работ</div>
    <div class="list-item">— Обеспечить безопасность выполняемых работ</div>
    <div class="list-item">— Своевременно извещать Заказчика о готовности промежуточных этапов работ</div>
    <div class="list-item">— Передать Заказчику Объект в установленный срок</div>
    <div class="text-bold">5.2. Заказчик обязуется:</div>
    <div class="list-item">— Своевременно производить оплату в соответствии с условиями настоящего Договора</div>
    <div class="list-item">— Предоставить Подрядчику доступ на земельный участок для выполнения работ</div>
    <div class="list-item">— Обеспечить подключение к источникам электроснабжения и водоснабжения для выполнения работ</div>
    <div class="list-item">— Принять выполненные работы и подписать акт приема-передачи</div>
    <div class="list-item">— Не вмешиваться в деятельность Подрядчика, если иное не предусмотрено Договором</div>
  </div>

  <div class="section">
    <div class="section-title">6. ГАРАНТИЙНЫЕ ОБЯЗАТЕЛЬСТВА</div>
    <div class="text">6.1. Подрядчик предоставляет гарантию на выполненные работы сроком на 5 (пять) лет с даты подписания акта приема-передачи.</div>
    <div class="text">6.2. В гарантийный период Подрядчик обязуется безвозмездно устранить выявленные недостатки, возникшие по его вине.</div>
    <div class="text">6.3. Гарантия не распространяется на недостатки, возникшие вследствие:</div>
    <div class="list-item">— Нормального износа</div>
    <div class="list-item">— Неправильной эксплуатации Объекта</div>
    <div class="list-item">— Действий третьих лиц или обстоятельств непреодолимой силы</div>
    <div class="list-item">— Изменений, внесенных Заказчиком без согласования с Подрядчиком</div>
  </div>

  <div class="section">
    <div class="section-title">7. ПРИЕМКА РАБОТ</div>
    <div class="text">7.1. Приемка выполненных работ производится Заказчиком в течение 7 (семи) календарных дней с даты уведомления Подрядчиком о готовности работ.</div>
    <div class="text">7.2. Результаты приемки работ оформляются актом приема-передачи выполненных работ по форме, утвержденной законодательством Российской Федерации.</div>
    <div class="text">7.3. При обнаружении недостатков в выполненных работах Заказчик обязан указать на них в акте приема-передачи или направить Подрядчику мотивированный отказ от приемки работ.</div>
    <div class="text">7.4. В случае если Заказчик в установленный срок не приступил к приемке работ либо уклоняется от приемки, работы считаются принятыми, а акт приема-передачи — подписанным со дня истечения срока приемки.</div>
  </div>

  <div class="section">
    <div class="section-title">8. ОТВЕТСТВЕННОСТЬ СТОРОН</div>
    <div class="text">8.1. За неисполнение или ненадлежащее исполнение обязательств по настоящему Договору Стороны несут ответственность в соответствии с действующим законодательством Российской Федерации.</div>
    <div class="text">8.2. В случае просрочки оплаты Заказчиком Подрядчик вправе приостановить выполнение работ до момента полной оплаты задолженности.</div>
    <div class="text">8.3. В случае просрочки выполнения работ по вине Подрядчика Подрядчик уплачивает Заказчику неустойку в размере 0,1% от стоимости невыполненных работ за каждый день просрочки, но не более 10% от общей стоимости работ.</div>
    <div class="text">8.4. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему Договору, если это неисполнение явилось следствием обстоятельств непреодолимой силы (форс-мажор).</div>
  </div>

  <div class="section">
    <div class="section-title">9. РАЗРЕШЕНИЕ СПОРОВ</div>
    <div class="text">9.1. Все споры и разногласия, возникающие между Сторонами в связи с настоящим Договором, решаются путем переговоров.</div>
    <div class="text">9.2. В случае невозможности достижения согласия споры подлежат разрешению в суде по месту нахождения Подрядчика в соответствии с законодательством Российской Федерации.</div>
  </div>

  <div class="section page-break">
    <div class="section-title">10. ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ</div>
    <div class="text">10.1. Настоящий Договор вступает в силу с момента его подписания Сторонами и действует до полного исполнения Сторонами своих обязательств.</div>
    <div class="text">10.2. Изменения и дополнения к настоящему Договору должны быть совершены в письменной форме и подписаны обеими Сторонами.</div>
    <div class="text">10.3. Все приложения к настоящему Договору являются его неотъемлемой частью.</div>
    <div class="text">10.4. Настоящий Договор составлен в двух экземплярах, имеющих равную юридическую силу, по одному для каждой из Сторон.</div>
  </div>

  <div class="signature-block">
    <div class="signature-label">ПОДРЯДЧИК:</div>
    <div class="text">ИП ГЮЛЬАХМЕДОВ АТАЙ ЭДИСОНОВИЧ</div>
    <div class="text" style="margin-top: 10px;">___________________ / ГЮЛЬАХМЕДОВ А.Э. /</div>
    <div class="text" style="margin-top: 10px;">М.П.</div>
  </div>

  <div class="signature-block">
    <div class="signature-label">ЗАКАЗЧИК:</div>
    <div class="text">___________________ (ФИО полностью)</div>
    <div class="text" style="margin-top: 10px;">___________________ / ___________________ /</div>
  </div>

  <div class="footer">
    <div>© 2025 ${companyName}. Все права защищены.</div>
    <div>Типовой договор. Фактические условия согласовываются при заключении договора.</div>
  </div>
</body>
</html>
`

export async function GET() {
  let browser
  try {
    // Проверяем, есть ли загруженный файл типового договора
    const config = await prisma.contractTemplateConfig.findFirst()
    
    if (config?.filePath) {
      const filePath = join(process.cwd(), 'public', config.filePath)
      if (existsSync(filePath)) {
        // Возвращаем загруженный файл
        const fileBuffer = await readFile(filePath)
        return new NextResponse(fileBuffer as unknown as BodyInit, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="dogovor-podryada-dachnye-domiki-bytovki.pdf"',
            'Content-Length': fileBuffer.length.toString(),
          },
        })
      }
    }

    // Получаем название компании из базы данных
    const footerConfig = await prisma.footerConfig.findFirst()
    const companyName = footerConfig?.companyName || 'Дачные-Домики-Бытовки'

    // Если файла нет, генерируем PDF из HTML шаблона
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()
    await page.setContent(getContractHTML(companyName), { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true
    })

    await browser.close()

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="dogovor-podryada-dachnye-domiki-bytovki.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    if (browser) {
      await browser.close()
    }
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { 
        error: 'Ошибка при генерации PDF документа', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
