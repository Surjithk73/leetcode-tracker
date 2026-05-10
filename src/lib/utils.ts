import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Converts a question name to a LeetCode problem URL */
export function toLeetCodeUrl(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return `https://leetcode.com/problems/${slug}/`
}

/** If input is a LeetCode URL, extract and title-case the name. Otherwise return as-is. */
export function extractNameFromUrl(input: string): string {
  const match = input.match(/leetcode\.com\/problems\/([^/]+)/i)
  if (!match) return input
  return match[1]
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/** Returns true if the string looks like a LeetCode URL */
export function isLeetCodeUrl(input: string): boolean {
  return /leetcode\.com\/problems\//i.test(input)
}
