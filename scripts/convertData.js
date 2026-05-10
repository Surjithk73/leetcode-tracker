// Script to convert Striver and NeetCode JSON files to the required format

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the source files
const striverRaw = JSON.parse(fs.readFileSync(path.join(__dirname, '../../striversde.json'), 'utf8'));
const neetcodeRaw = JSON.parse(fs.readFileSync(path.join(__dirname, '../../neetcode150.json'), 'utf8'));

// Topic mapping for Striver (based on the categories in the JSON)
const striverTopicMap = {
  'arrayI': 'Arrays',
  'arrayII': 'Arrays',
  'arrayIII': 'Arrays',
  'arrayIV': 'Arrays',
  'linkedlistI': 'Linked Lists',
  'linkedlistII': 'Linked Lists',
  'linkedlistIII': 'Linked Lists',
  'greedy': 'Greedy',
  'recursion': 'Backtracking',
  'recursionandbacktracing': 'Backtracking',
  'binarysearch': 'Binary Search',
  'heap': 'Heaps',
  'stackandqueueI': 'Stacks',
  'stackandqueueII': 'Stacks',
  'stringI': 'Strings',
  'stringII': 'Strings',
  'binarytreeI': 'Trees',
  'binarytreeII': 'Trees',
  'binarytreeIII': 'Trees',
  'binarysearchtreeI': 'Trees',
  'binarysearchtreeII': 'Trees',
  'binarytreemisc': 'Trees',
  'graphI': 'Graphs',
  'graphII': 'Graphs',
  'dynamicprogrammingI': 'Dynamic Programming',
  'dynamicprogrammingII': 'Dynamic Programming',
  'trie': 'Tries'
};

// Topic mapping for NeetCode
const neetcodeTopicMap = {
  'Arrays & Hashing': 'Arrays',
  'Two Pointers': 'Two Pointers',
  'Sliding Window': 'Sliding Window',
  'Stack': 'Stacks',
  'Binary Search': 'Binary Search',
  'Linked List': 'Linked Lists',
  'Trees': 'Trees',
  'Heap / Priority Queue': 'Heaps',
  'Backtracking': 'Backtracking',
  'Tries': 'Tries',
  'Graphs': 'Graphs',
  'Advanced Graphs': 'Graphs',
  '1-D Dynamic Programming': 'Dynamic Programming',
  '2-D Dynamic Programming': 'Dynamic Programming',
  'Greedy': 'Greedy',
  'Intervals': 'Intervals',
  'Math & Geometry': 'Arrays',
  'Bit Manipulation': 'Bit Manipulation'
};

// Extract slug from LeetCode URL
function extractSlug(url) {
  const match = url.match(/leetcode\.com\/problems\/([^/]+)/i);
  return match ? match[1] : '';
}

// Convert Striver data
const striverQuestions = [];
let striverGlobalOrder = 0;

for (const [category, questions] of Object.entries(striverRaw)) {
  const topic = striverTopicMap[category] || 'Arrays';
  
  questions.forEach((q) => {
    const slug = extractSlug(q.Question_link);
    striverQuestions.push({
      id: `striver_${q.id}`,
      title: q.Question,
      slug: slug,
      topic: topic,
      difficulty: 'Medium', // Striver doesn't specify, default to Medium
      source: 'striver',
      order: striverGlobalOrder++
    });
  });
}

// Convert NeetCode data
const neetcodeQuestions = [];
let neetcodeGlobalOrder = 0;

for (const [category, questions] of Object.entries(neetcodeRaw)) {
  const topic = neetcodeTopicMap[category] || 'Arrays';
  
  for (const [title, data] of Object.entries(questions)) {
    const slug = extractSlug(data.url);
    neetcodeQuestions.push({
      id: `neetcode_${neetcodeGlobalOrder}`,
      title: title,
      slug: slug,
      topic: topic,
      difficulty: data.difficulty,
      source: 'neetcode',
      order: neetcodeGlobalOrder++
    });
  }
}

// Write output files
fs.writeFileSync(
  path.join(__dirname, '../src/data/striver_sde.json'),
  JSON.stringify(striverQuestions, null, 2)
);

fs.writeFileSync(
  path.join(__dirname, '../src/data/neetcode150.json'),
  JSON.stringify(neetcodeQuestions, null, 2)
);

console.log(`✅ Converted ${striverQuestions.length} Striver questions`);
console.log(`✅ Converted ${neetcodeQuestions.length} NeetCode questions`);
console.log('✅ Files written to src/data/');
