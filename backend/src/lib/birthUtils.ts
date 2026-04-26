import { BirthInfo } from '../saju/calculator';

export function buildBirthKey(info: BirthInfo): string {
  return `${info.year}-${info.month}-${info.day}-${info.hour}-${info.minute}-${info.gender}`;
}

export function parseBirthInfo(body: Record<string, any>): BirthInfo {
  const { year, month, day, hour, minute, gender, unknownHour } = body;
  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: unknownHour ? 0 : Number(hour ?? 0),
    minute: unknownHour ? 0 : Number(minute ?? 0),
    gender,
    unknownHour: !!unknownHour,
  };
}
