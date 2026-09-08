export const progressData = {
    weightEntries: [
        { id: 'w1', date: '2026-08-11', weightKg: 80.2 },
        { id: 'w2', date: '2026-08-18', weightKg: 79.4 },
        { id: 'w3', date: '2026-08-25', weightKg: 78.6 },
        { id: 'w4', date: '2026-09-01', weightKg: 78.1 },
        { id: 'w5', date: '2026-09-07', weightKg: 77.6 },
    ],
    measurements: [
        { id: 'm1', date: '2026-08-10', chestCm: 102, waistCm: 89, armsCm: 38, hipsCm: 100, thighsCm: 61 },
        { id: 'm2', date: '2026-08-26', chestCm: 101, waistCm: 88, armsCm: 38.5, hipsCm: 99, thighsCm: 60 },
        { id: 'm3', date: '2026-09-08', chestCm: 100, waistCm: 87, armsCm: 39, thighsCm: 59 },
    ],
    performance: [
        { id: 'p1', week: '2026-08-10', totalVolumeKg: 9800, sessions: 4 },
        { id: 'p2', week: '2026-08-17', totalVolumeKg: 11250, sessions: 5 },
        { id: 'p3', week: '2026-08-24', totalVolumeKg: 12400, sessions: 4 },
        { id: 'p4', week: '2026-08-31', totalVolumeKg: 13800, sessions: 5 },
        { id: 'p5', week: '2026-09-07', totalVolumeKg: 15100, sessions: 5 },
    ],
    strengthHistory: [
        { id: 's1', exercise: 'Deadlift', date: '2026-09-06', prKg: 150, sets: 3, reps: 5 },
        { id: 's2', exercise: 'Bench Press', date: '2026-08-29', prKg: 95, sets: 4, reps: 8 },
        { id: 's3', exercise: 'Squat', date: '2026-08-22', prKg: 120, sets: 5, reps: 5 },
        { id: 's4', exercise: 'Overhead Press', date: '2026-08-14', prKg: 55, sets: 3, reps: 8 },
    ],
    workoutDates: [
        '2026-08-10',
        '2026-08-11',
        '2026-08-12',
        '2026-08-15',
        '2026-08-16',
        '2026-08-19',
        '2026-08-20',
        '2026-08-21',
        '2026-08-22',
        '2026-09-01',
        '2026-09-02',
        '2026-09-04',
        '2026-09-05',
        '2026-09-07',
        '2026-09-08',
    ],
};

export const emptyProgressData = {
    weightEntries: [],
    measurements: [],
    performance: [],
    strengthHistory: [],
    workoutDates: [],
};