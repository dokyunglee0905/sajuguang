import { Router, Request, Response } from 'express';
import { calculateSaju, BirthInfo } from '../saju/calculator';
import { CHEONGAN } from '../data/cheongan';
import { JIJI } from '../data/jiji';
import { OHAENG_DESC } from '../data/ohaeng';
import { SIPSEONG_DESC } from '../data/sipseong';

const router = Router();

router.post('/calculate', (req: Request, res: Response) => {
  const { year, month, day, hour, minute, gender, unknownHour } = req.body;

  if (!year || !month || !day || !gender) {
    res.status(400).json({ error: '년, 월, 일, 성별은 필수입니다.' });
    return;
  }

  const birthInfo: BirthInfo = {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: unknownHour ? 0 : Number(hour ?? 0),
    minute: unknownHour ? 0 : Number(minute ?? 0),
    gender,
    unknownHour: !!unknownHour,
  };

  const result = calculateSaju(birthInfo);

  const mainOhaengInfo = OHAENG_DESC[CHEONGAN.find(c => c.name === result.ilgan)?.element ?? ''];
  const animal = JIJI.find(j => j.name === result.dayPillar.jiji)?.animal ?? '';

  const topSipseong = Object.entries(result.sipseongScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, score]) => ({
      name,
      score,
      ...SIPSEONG_DESC[name],
    }));

  res.json({
    pillars: {
      year: result.yearPillar,
      month: result.monthPillar,
      day: result.dayPillar,
      hour: result.hourPillar,
    },
    ilgan: result.ilgan,
    mainOhaeng: {
      element: CHEONGAN.find(c => c.name === result.ilgan)?.element ?? '',
      ...mainOhaengInfo,
    },
    animal,
    ohaengCount: result.ohaengCount,
    topSipseong,
    sipseongScores: result.sipseongScores,
    singangsinyak: result.singangsinyak,
    daewoonList: result.daewoonList,
    unknownHour: result.unknownHour,
  });
});

export default router;
