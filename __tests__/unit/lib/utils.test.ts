import { cn, formatPrice, formatDate, formatRelativeTime, truncateText } from '@/lib/utils'

describe('Utils Functions', () => {
  describe('cn (className utility)', () => {
    it('combines class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('handles conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional')
    })

    it('merges Tailwind classes correctly', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
    })

    it('handles undefined and null values', () => {
      expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2')
    })

    it('handles empty input', () => {
      expect(cn()).toBe('')
    })

    it('handles arrays of classes', () => {
      expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3')
    })

    it('handles objects with boolean values', () => {
      expect(cn({
        'class1': true,
        'class2': false,
        'class3': true,
      })).toBe('class1 class3')
    })
  })

  describe('formatPrice', () => {
    it('formats price in Japanese Yen', () => {
      expect(formatPrice(1000)).toBe('￥1,000')
    })

    it('handles zero price', () => {
      expect(formatPrice(0)).toBe('￥0')
    })

    it('handles decimal prices', () => {
      expect(formatPrice(999.99)).toBe('￥1,000')
    })

    it('handles large prices', () => {
      expect(formatPrice(1000000)).toBe('￥1,000,000')
    })

    it('handles negative prices', () => {
      expect(formatPrice(-500)).toBe('-￥500')
    })
  })

  describe('formatDate', () => {
    it('formats date in Japanese format', () => {
      const date = new Date('2024-03-15')
      const formatted = formatDate(date)
      expect(formatted).toMatch(/2024\/3\/15/)
    })

    it('handles different dates consistently', () => {
      const date1 = new Date('2023-12-31')
      const date2 = new Date('2024-01-01')
      
      expect(formatDate(date1)).toMatch(/2023\/12\/31/)
      expect(formatDate(date2)).toMatch(/2024\/1\/1/)
    })
  })

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      // Mock current time to 2024-03-15 12:00:00
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-03-15T12:00:00Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('returns "たった今" for very recent times', () => {
      const thirtySecondsAgo = new Date('2024-03-15T11:59:30Z')
      expect(formatRelativeTime(thirtySecondsAgo)).toBe('たった今')
    })

    it('returns minutes for times within an hour', () => {
      const fifteenMinutesAgo = new Date('2024-03-15T11:45:00Z')
      expect(formatRelativeTime(fifteenMinutesAgo)).toBe('15分前')
    })

    it('returns hours for times within a day', () => {
      const threeHoursAgo = new Date('2024-03-15T09:00:00Z')
      expect(formatRelativeTime(threeHoursAgo)).toBe('3時間前')
    })

    it('returns days for older times', () => {
      const threeDaysAgo = new Date('2024-03-12T12:00:00Z')
      expect(formatRelativeTime(threeDaysAgo)).toBe('3日前')
    })

    it('handles edge cases correctly', () => {
      // Exactly 1 minute ago
      const oneMinuteAgo = new Date('2024-03-15T11:59:00Z')
      expect(formatRelativeTime(oneMinuteAgo)).toBe('1分前')

      // Exactly 1 hour ago
      const oneHourAgo = new Date('2024-03-15T11:00:00Z')
      expect(formatRelativeTime(oneHourAgo)).toBe('1時間前')

      // Exactly 1 day ago
      const oneDayAgo = new Date('2024-03-14T12:00:00Z')
      expect(formatRelativeTime(oneDayAgo)).toBe('1日前')
    })
  })

  describe('truncateText', () => {
    it('returns original text when shorter than max length', () => {
      expect(truncateText('Short text', 20)).toBe('Short text')
    })

    it('truncates text when longer than max length', () => {
      expect(truncateText('This is a very long text', 10)).toBe('This is a ...')
    })

    it('returns original text when exactly max length', () => {
      expect(truncateText('Exact', 5)).toBe('Exact')
    })

    it('handles empty string', () => {
      expect(truncateText('', 10)).toBe('')
    })

    it('handles max length of 0', () => {
      expect(truncateText('Any text', 0)).toBe('...')
    })

    it('handles max length of 1', () => {
      expect(truncateText('Any text', 1)).toBe('A...')
    })

    it('handles unicode characters', () => {
      expect(truncateText('こんにちは世界', 5)).toBe('こんにちは...')
    })

    it('handles special characters', () => {
      expect(truncateText('Hello! @#$%^&*()', 8)).toBe('Hello! @...')
    })

    it('preserves spaces correctly', () => {
      expect(truncateText('Hello world test', 11)).toBe('Hello world...')
    })
  })
})