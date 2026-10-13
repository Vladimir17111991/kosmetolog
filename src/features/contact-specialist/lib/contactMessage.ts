export function contactMessage(serviceName?: string): string {
  const service = serviceName?.trim();
  return service
    ? `Здравствуйте, Ольга! Хочу записаться на процедуру «${service}». Подскажите, пожалуйста, ближайшее свободное время.`
    : 'Здравствуйте, Ольга! Хочу обсудить первый визит и подобрать процедуру. Подскажите, пожалуйста, ближайшее свободное время.';
}
