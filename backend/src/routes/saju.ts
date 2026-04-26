import { Router, Request, Response } from 'express';
import { calculateSaju } from '../saju/calculator';
import { CHEONGAN } from '../data/cheongan';
import { JIJI } from '../data/jiji';
import { OHAENG_DESC } from '../data/ohaeng';
import { SIPSEONG_DESC } from '../data/sipseong';
import { validateBirthFields, parseBirthInfo } from '../lib/birthUtils';

const router = Router();

router.post('/calculate', (req: Request, res: Response) => {
  const validationError = validateBirthFields(req.body);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  const birthInfo = parseBirthInfo(req.body);

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
