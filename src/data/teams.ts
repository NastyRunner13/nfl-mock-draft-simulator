import { Team } from '@/types';

/**
 * Top 7 picks in the 2026 NFL Draft.
 * Pick order and needs taken directly from the assignment document.
 */
export const teams: Team[] = [
    {
        id: 1,
        name: 'Las Vegas Raiders',
        abbreviation: 'LV',
        needs: ['QB', 'CB', 'OL'],
        context:
            'No long-term QB after Geno Smith trade failed. Secondary leaks. O-line needs rebuilding.',
        color: '#A5ACAF',
    },
    {
        id: 2,
        name: 'New York Jets',
        abbreviation: 'NYJ',
        needs: ['OL', 'WR', 'QB'],
        context:
            'Full roster reset after trade deadline teardown. O-line is the foundation to rebuild.',
        color: '#125740',
    },
    {
        id: 3,
        name: 'Arizona Cardinals',
        abbreviation: 'ARI',
        needs: ['QB', 'OL', 'WR'],
        context:
            "Kyler Murray's future uncertain after 3-14 season. Offense needs major upgrades.",
        color: '#97233F',
    },
    {
        id: 4,
        name: 'Tennessee Titans',
        abbreviation: 'TEN',
        needs: ['OL', 'WR', 'EDGE'],
        context:
            'Must protect and support 2025 #1 pick Cam Ward. Need weapons and pass rush.',
        color: '#4B92DB',
    },
    {
        id: 5,
        name: 'New York Giants',
        abbreviation: 'NYG',
        needs: ['WR', 'EDGE', 'OL'],
        context:
            'Need playmakers around QB Jaxon Dart. Pass rush was inconsistent.',
        color: '#0B2265',
    },
    {
        id: 6,
        name: 'Cleveland Browns',
        abbreviation: 'CLE',
        needs: ['EDGE', 'WR', 'CB'],
        context:
            'Fewest receiving yards in the NFL in 2025. Need pass rush help.',
        color: '#311D00',
    },
    {
        id: 7,
        name: 'Washington Commanders',
        abbreviation: 'WSH',
        needs: ['EDGE', 'CB', 'LB'],
        context:
            'Oldest roster in NFL. Defense needs youth and speed everywhere.',
        color: '#5A1414',
    },
];
