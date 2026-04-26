import { BirthInfo } from '../saju/calculator';

const CURRENT_YEAR = new Date().getFullYear();

export function validateBirthFields(body: Record<string, any>): string | null {
  const year = Number(body.year);
  const month = Number(body.month);
  const day = Number(body.day);
  const hour = Number(body.hour ?? 0);
  const minute = Number(body.minute ?? 0);
  const gender = body.gender;

  if (!body.year || !body.month || !body.day || !gender) {
    return '생년월일과 성별은 필수입니다.';
  }
  if (!['남', '여'].includes(gender)) return '성별은 남 또는 여 이어야 합니다.';
  if (isNaN(year) || year < 1930 || year > CURRENT_YEAR) return '생년이 올바르지 않습니다.';
  if (isNaN(month) || month < 1 || month > 12) return '월이 올바르지 않습니다.';
  if (isNaN(day) || day < 1 || day > 31) return '일이 올바르지 않습니다.';
  if (!body.unknownHour) {
    if (isNaN(hour) || hour < 0 || hour > 23) return '시간이 올바르지 않습니다.';
    if (isNaN(minute) || minute < 0 || minute > 59) return '분이 올바르지 않습니다.';
  }

  // 실제 존재하는 날짜인지 확인 (e.g. 2월 29일 비윤년)
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return '존재하지 않는 날짜입니다.';
  }

  return null;
}

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
