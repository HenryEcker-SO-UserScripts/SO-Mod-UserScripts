type DiscussionFlagType = 'Spam' | 'Should be a question' | 'Something else' | 'Rude or abusive';

interface CountRecord {
    unduplicatedCount: number;
    count: number;
}

type SummaryFlagCount = Record<DiscussionFlagType, CountRecord>;
type UserStats = {
    displayName: string;
} & SummaryFlagCount;
type UserSummaryStats = Record<number, UserStats>;

interface UserInfo {
    userId: number;
    displayName: string;
}


function pluralise(count: number, base: string) {
    return count === 1 ? base : `${base}s`;
}

function* jQueryGen($jqueryElem: JQuery<HTMLElement>) {
    for (const node of $jqueryElem) {
        yield $(node);
    }
}


function computeStats($postContainers: JQuery<HTMLElement>) {

    const summaryStats: SummaryFlagCount = <SummaryFlagCount>{};
    const flaggedUserSummaryStats: UserSummaryStats = <UserSummaryStats>{};
    const flaggerSummaryStats: UserSummaryStats = <UserSummaryStats>{};

    function getPostFlagDetails($postFlagGroup: JQuery<HTMLElement>): {
        flagCount: number;
        flagType: DiscussionFlagType;
        $flaggers: JQuery<HTMLElement>;
    } {
        const flagCount = Number(
            $postFlagGroup
                .find('.iconFlagSm')
                .parent()
                .text()
                .trim()
        );
        const $flagDetailElem = $postFlagGroup.find('.flex--item');
        let [flagType] =
            $flagDetailElem
                .text()
                .split(' – ');

        flagType = flagType.trim();

        if (flagType.startsWith('Something else:')) {
            flagType = 'Something else';
        }

        return {
            flagCount,
            flagType: <DiscussionFlagType>flagType,
            $flaggers: $flagDetailElem.find('a[href^="/users/"]')
        };
    }

    function getUserInfo($userAnchor: JQuery<HTMLElement>): UserInfo {
        return {
            displayName: $userAnchor.text().trim(),
            userId: Number($userAnchor.attr('href').match(/^\/users\/(\d+)\//i)[1])
        };
    }

    function accumulateUserSummaryStats(uss: UserSummaryStats, userInfo: UserInfo, flagType: DiscussionFlagType, flagCount: number) {
        if (uss?.[userInfo.userId] === undefined) {
            uss[userInfo.userId] = <UserStats>{
                displayName: userInfo.displayName
            };
        }
        if (uss[userInfo.userId]?.[flagType] === undefined) {
            uss[userInfo.userId][flagType] = {
                unduplicatedCount: 0,
                count: 0
            };

        }
        uss[userInfo.userId][flagType].unduplicatedCount += 1;
        uss[userInfo.userId][flagType].count += flagCount;
    }

    for (const $postContainer of jQueryGen($postContainers)) {
        for (const $postFlagGroup of jQueryGen($postContainer.find('.js-post-flag-group'))) {
            const {flagType, flagCount, $flaggers} = getPostFlagDetails($postFlagGroup);

            if (summaryStats?.[flagType] === undefined) {
                summaryStats[flagType] = {
                    unduplicatedCount: 0,
                    count: 0
                };
            }
            summaryStats[flagType].unduplicatedCount += 1;
            summaryStats[flagType].count += flagCount;

            accumulateUserSummaryStats(flaggedUserSummaryStats, getUserInfo($postContainer.find('.s-user-card--link')), flagType, flagCount);

            for (const $flagger of jQueryGen($flaggers)) {
                accumulateUserSummaryStats(flaggerSummaryStats, getUserInfo($flagger), flagType, 1);
            }
        }
    }
    return {
        summaryStats,
        flaggedUserSummaryStats,
        flaggerSummaryStats
    };
}


// @ts-expect-error: Main is in multiple unrelated projects with the same tsconfig
function main() {
    const $postContainers = $('.js-post-container');
    const uniquePostCount = $postContainers.length;

    if (uniquePostCount === 0) {
        // Do nothing if no flags
        return;
    }

    $('#mainbar header .s-page-title--header').append(` (on ${uniquePostCount} Posts)`);

    const {summaryStats, flaggedUserSummaryStats, flaggerSummaryStats} = computeStats($postContainers);
    const $userScriptMasterContainer = $('<div id="dbfs-summary" class="mb24"></div>');
    $('#mainbar header').after($userScriptMasterContainer);

    function formatCountRecord(cr?: CountRecord): string {
        if (cr === undefined) {
            return '0';
        } else {
            return `${cr.count} ${pluralise(cr.count, 'flag')} (on ${cr.unduplicatedCount} ${pluralise(cr.unduplicatedCount, 'post')})`;
        }
    }

    function buildTable(tableTitle: string, theadData: string[][], tbodyData: string[][], tableContainerStyles?: string[]) {
        const $summaryContainer = $('<div class="s-table-container"></div>');
        if (tableContainerStyles !== undefined) {
            for (const style of tableContainerStyles) {
                $summaryContainer.addClass(style);
            }
        }
        const $table = $('<table class="s-table"></table>');

        {
            const $thead = $('<thead></thead>');
            for (const trData of theadData) {
                const $tr = $('<tr></tr>');
                for (const thData of trData) {
                    $tr.append($(`<th>${thData}</th>`));
                }
                $thead.append($tr);
            }
            $table.append($thead);
        }

        {
            const $tbody = $('<tbody class="ws-nowrap"></tbody>');
            for (const trData of tbodyData) {
                const $tr = $('<tr></tr>');
                for (const tdData of trData) {
                    $tr.append($(`<td>${tdData}</td>`));
                }
                $tbody.append($tr);
            }
            $table.append($tbody);
        }

        $summaryContainer.append($table);

        return $(`<div class="my12"><h2>${tableTitle}</h2></div>`).append($summaryContainer);
    }

    function buildSummaryTable(ss: SummaryFlagCount): JQuery<HTMLElement> {
        return buildTable(
            'Flag Summary Statistics',
            [['Flag Type', 'Count']],
            Object.entries(ss)
                .sort(([_0, crA], [_1, crB]) => crB.count - crA.count)
                .map(([flagType, flagCountRecord]) => {
                    return [flagType, formatCountRecord(flagCountRecord)];
                })
        );
    }

    $userScriptMasterContainer
        .append(buildSummaryTable(summaryStats));

    function buildUserTable(title: string, flagTypes: DiscussionFlagType[], uss: UserSummaryStats, linkSuffix = '', useDetailCount = true): JQuery<HTMLElement> {
        const tbodyData = (<[string, { total: number; } & UserStats][]>Object.entries(uss)).map((e) => {
            e[1].total = 0;
            for (const ft of flagTypes) {
                e[1].total += e[1]?.[ft]?.count || 0;
            }
            return e;
        }).sort(
            ([_0, a], [_1, b]) => b.total - a.total
        ).map(([userId, userStats]) => {
            return [
                `<a href="/users/${userId}/${linkSuffix}" target="_blank">${userStats.displayName}</a>`,
                ...[...flagTypes].map((ft) => {
                    if (useDetailCount) {
                        return formatCountRecord(userStats?.[ft]);
                    } else {
                        return `${userStats?.[ft]?.count || 0}`;
                    }
                }),
                userStats.total.toString()
            ];
        });
        return buildTable(
            `${tbodyData.length} ${pluralise(tbodyData.length, title)}`,
            [['User', ...flagTypes, 'Total']],
            tbodyData,
            ['hmx4']
        );
    }

    const filteredFlagTypes = (<[DiscussionFlagType, CountRecord][]>Object.entries(summaryStats))
            .sort(([_0, a], [_1, b]) => b.count - a.count)
            .map(([e, _0]) => e);

    $userScriptMasterContainer
        .append(buildUserTable('Flagged User', filteredFlagTypes, flaggedUserSummaryStats, '?tab=activity&sort=discussions'))
        .append(buildUserTable('Flagger', filteredFlagTypes, flaggerSummaryStats, undefined, false));
}

StackExchange.ready(main);