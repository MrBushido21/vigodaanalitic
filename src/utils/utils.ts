export const getToday = () => {
    return new Date().setHours(0, 0, 0, 0)
}

export const classifyReferrer = (referrer: string): string => {
    if (!referrer) return 'direct'
    if (/google|bing|yahoo|yandex/i.test(referrer)) return 'search'
    if (/facebook|instagram|tiktok|vk\.com|twitter/i.test(referrer)) return 'social'
    return 'referral'
}
