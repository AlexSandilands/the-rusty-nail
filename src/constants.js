const ScreenshotSize = Object.freeze({
    SMALL: 345,
    LARGE: 750,
    FULL: -1
});

const ConfirmSchedule = Object.freeze({
    WEEKDAY: 6,
    HOUR_LOCAL: 20,
    TIME_ZONE: 'Pacific/Auckland'
});

const DndRules = Object.freeze({
    PHB: 'https://www.dndbeyond.com/sources/dnd/phb-2024',
    Cleric: 'https://www.dndbeyond.com/sources/dnd/phb-2024/character-classes#Cleric',
    Druid: 'https://www.dndbeyond.com/sources/dnd/phb-2024/character-classes#Druid',
    Ranger: 'https://www.dndbeyond.com/sources/dnd/phb-2024/character-classes-continued#Ranger',
    Rogue: 'https://www.dndbeyond.com/sources/dnd/phb-2024/character-classes-continued#Rogue',
    Wizard: 'https://www.dndbeyond.com/sources/dnd/phb-2024/character-classes-continued#Wizard',
});

module.exports = {
    ScreenshotSize,
    ConfirmSchedule,
    DndRules
};
