const ScreenshotSize = Object.freeze({
    SMALL: 345,
    LARGE: 750,
    FULL: -1
});

const ConfirmSchedule = Object.freeze({
    WEEKDAY: 6,
    HOUR_LOCAL: 20,
    MINUTE_LOCAL: 0,
    TIME_ZONE: 'Pacific/Auckland'
});

const ConfirmTimes = Object.freeze([
    { value: '17:00', label: '5:00 PM NZST', hour: 17, minute: 0 },
    { value: '17:30', label: '5:30 PM NZST', hour: 17, minute: 30 },
    { value: '18:00', label: '6:00 PM NZST', hour: 18, minute: 0 },
    { value: '18:30', label: '6:30 PM NZST', hour: 18, minute: 30 },
    { value: '19:00', label: '7:00 PM NZST', hour: 19, minute: 0 },
    { value: '19:30', label: '7:30 PM NZST', hour: 19, minute: 30 },
    { value: '20:00', label: '8:00 PM NZST', hour: 20, minute: 0 },
    { value: '20:30', label: '8:30 PM NZST', hour: 20, minute: 30 },
    { value: '21:00', label: '9:00 PM NZST', hour: 21, minute: 0 }
].map(Object.freeze));

const DndRules = Object.freeze({
    PHB: 'https://www.dndbeyond.com/sources/dnd/phb-2024',
    Cleric: 'https://www.dndbeyond.com/sources/dnd/phb-2024/character-classes#Cleric',
    Druid: 'https://www.dndbeyond.com/sources/dnd/phb-2024/character-classes#Druid',
    Ranger: 'https://www.dndbeyond.com/sources/dnd/phb-2024/character-classes-continued#Ranger',
    Rogue: 'https://www.dndbeyond.com/sources/dnd/phb-2024/character-classes-continued#Rogue',
    Wizard: 'https://www.dndbeyond.com/sources/dnd/phb-2024/character-classes-continued#Wizard',
});

const DndMoods = Object.freeze({
    excited: 'dnd excited',
    worried: 'dnd worried',
    scared: 'dnd scared',
    happy: 'dnd happy',
    sad: 'dnd sad',
    angry: 'dnd angry'
});

module.exports = {
    ScreenshotSize,
    ConfirmSchedule,
    ConfirmTimes,
    DndRules,
    DndMoods
};
