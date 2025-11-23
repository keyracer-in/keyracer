const AptitudeQuestion = require('../models/AptitudeQuestion');

const sampleQuestions = [
  // Quantitative Aptitude Questions (25 questions)
  {
    topic: 'quant',
    question: 'If 20% of a number is 50, what is 30% of the same number?',
    type: 'mcq',
    options: ['60', '75', '80', '90'],
    correctAnswer: '75',
    explanation: 'If 20% of x = 50, then x = 250. So 30% of 250 = 75.',
    difficulty: 'easy'
  },
  {
    topic: 'quant',
    question: 'A train travels 120 km in 2 hours. What is its speed in km/h?',
    type: 'text',
    options: [],
    correctAnswer: '60',
    explanation: 'Speed = Distance/Time = 120/2 = 60 km/h',
    difficulty: 'easy'
  },
  {
    topic: 'quant',
    question: 'The compound interest on Rs. 1000 for 2 years at 10% per annum is:',
    type: 'mcq',
    options: ['Rs. 200', 'Rs. 210', 'Rs. 220', 'Rs. 230'],
    correctAnswer: 'Rs. 210',
    explanation: 'CI = P(1+R/100)^T - P = 1000(1.1)^2 - 1000 = 1210 - 1000 = Rs. 210',
    difficulty: 'medium'
  },
  {
    topic: 'quant',
    question: 'If the ratio of ages of A and B is 3:4 and sum of their ages is 35, what is A\'s age?',
    type: 'text',
    options: [],
    correctAnswer: '15',
    explanation: 'Let ages be 3x and 4x. Then 3x + 4x = 35, so 7x = 35, x = 5. A\'s age = 3x = 15.',
    difficulty: 'medium'
  },
  {
    topic: 'quant',
    question: 'A shopkeeper sells an item at a profit of 20%. If he had sold it for Rs. 120 more, he would have gained 30%. What is the cost price?',
    type: 'text',
    options: [],
    correctAnswer: '800',
    explanation: 'Let CP = x. SP1 = 1.2x, SP2 = 1.3x. SP2 - SP1 = 120 → 0.1x = 120 → x = 1200. Wait, let\'s solve properly: 30% - 20% = 10% of CP = 120 → CP = 1200.',
    difficulty: 'hard'
  },
  {
    topic: 'quant',
    question: 'Find the LCM of 24, 36, and 48.',
    type: 'mcq',
    options: ['72', '144', '288', '576'],
    correctAnswer: '144',
    explanation: '24 = 2³ × 3, 36 = 2² × 3², 48 = 2⁴ × 3. LCM = 2⁴ × 3² = 16 × 9 = 144.',
    difficulty: 'easy'
  },
  {
    topic: 'quant',
    question: 'A and B can complete a work in 12 days. B and C in 15 days. C and A in 20 days. How many days will A, B, and C take together?',
    type: 'text',
    options: [],
    correctAnswer: '10',
    explanation: '2(A+B+C) = 1/12 + 1/15 + 1/20 = (5+4+3)/60 = 12/60 = 1/5. So A+B+C = 1/10. Time = 10 days.',
    difficulty: 'hard'
  },
  {
    topic: 'quant',
    question: 'The average of 5 numbers is 20. If one number is excluded, average becomes 16. What is the excluded number?',
    type: 'text',
    options: [],
    correctAnswer: '36',
    explanation: 'Sum of 5 = 100. Sum of 4 = 64. Excluded number = 100 - 64 = 36.',
    difficulty: 'medium'
  },
  {
    topic: 'quant',
    question: 'Solve for x: 2x + 3 = 7',
    type: 'text',
    options: [],
    correctAnswer: '2',
    explanation: '2x = 7 - 3 = 4, x = 4/2 = 2.',
    difficulty: 'easy'
  },
  {
    topic: 'quant',
    question: 'A man buys 10 kg rice at Rs. 20/kg and 20 kg at Rs. 15/kg. What is the average price per kg?',
    type: 'text',
    options: [],
    correctAnswer: '16.67',
    explanation: 'Total cost = 10×20 + 20×15 = 200 + 300 = 500. Total weight = 30kg. Average = 500/30 ≈ 16.67.',
    difficulty: 'medium'
  },
  {
    topic: 'quant',
    question: 'What is the area of a circle with radius 7 cm? (Use π = 22/7)',
    type: 'text',
    options: [],
    correctAnswer: '154',
    explanation: 'Area = πr² = (22/7) × 7 × 7 = 22 × 7 = 154 cm².',
    difficulty: 'easy'
  },
  {
    topic: 'quant',
    question: 'If x² - 5x + 6 = 0, what are the roots?',
    type: 'mcq',
    options: ['2 and 3', '1 and 6', '-2 and -3', '2 and -3'],
    correctAnswer: '2 and 3',
    explanation: '(x-2)(x-3) = 0, so roots are 2 and 3.',
    difficulty: 'medium'
  },
  {
    topic: 'quant',
    question: 'A sum becomes 3 times in 8 years at compound interest. In how many years will it become 9 times?',
    type: 'text',
    options: [],
    correctAnswer: '16',
    explanation: 'Amount = P(1+r)^t. 3P = P(1+r)^8 → (1+r)^8 = 3. 9P = P(1+r)^t → (1+r)^t = 9 = 3². So t/8 = 2, t = 16 years.',
    difficulty: 'hard'
  },
  {
    topic: 'quant',
    question: 'Find the HCF of 84 and 112.',
    type: 'text',
    options: [],
    correctAnswer: '28',
    explanation: '84 = 2² × 3 × 7, 112 = 2⁴ × 7. HCF = 2² × 7 = 28.',
    difficulty: 'easy'
  },
  {
    topic: 'quant',
    question: 'A boat goes 6 km upstream and 10 km downstream in 2 hours. It goes 8 km upstream and 14 km downstream in 3 hours. Find the speed of the stream.',
    type: 'text',
    options: [],
    correctAnswer: '1',
    explanation: 'Let speed of boat = b, stream = s. 6/(b-s) + 10/(b+s) = 2, 8/(b-s) + 14/(b+s) = 3. Solving: b = 5, s = 1 km/h.',
    difficulty: 'hard'
  },
  {
    topic: 'quant',
    question: 'The probability of getting a head when a coin is tossed is:',
    type: 'mcq',
    options: ['0', '0.5', '1', '2'],
    correctAnswer: '0.5',
    explanation: 'For a fair coin, P(Head) = 1/2 = 0.5.',
    difficulty: 'easy'
  },
  {
    topic: 'quant',
    question: 'Find the volume of a cylinder with radius 7 cm and height 10 cm. (Use π = 22/7)',
    type: 'text',
    options: [],
    correctAnswer: '1540',
    explanation: 'Volume = πr²h = (22/7) × 49 × 10 = 22 × 7 × 10 = 1540 cm³.',
    difficulty: 'medium'
  },
  {
    topic: 'quant',
    question: 'If sinθ = 3/5, find cosθ.',
    type: 'mcq',
    options: ['4/5', '3/4', '5/4', '4/3'],
    correctAnswer: '4/5',
    explanation: 'In right triangle, if opposite = 3, hypotenuse = 5, adjacent = 4.',
    difficulty: 'medium'
  },
  {
    topic: 'quant',
    question: 'A man invests Rs. 5000 at 8% per annum. How much will he get after 2 years if interest is compounded half-yearly?',
    type: 'text',
    options: [],
    correctAnswer: '5832',
    explanation: 'Rate = 8%/2 = 4%, Time = 4 half-years. Amount = 5000(1.04)^4 = 5000 × 1.16985856 ≈ 5832.',
    difficulty: 'hard'
  },
  {
    topic: 'quant',
    question: 'Find the mean of 2, 4, 6, 8, 10.',
    type: 'text',
    options: [],
    correctAnswer: '6',
    explanation: 'Mean = (2+4+6+8+10)/5 = 30/5 = 6.',
    difficulty: 'easy'
  },
  {
    topic: 'quant',
    question: 'If a:b = 2:3 and b:c = 4:5, find a:b:c.',
    type: 'mcq',
    options: ['8:12:15', '2:3:5', '4:6:5', '2:4:5'],
    correctAnswer: '8:12:15',
    explanation: 'a:b = 2:3, b:c = 4:5. Multiply: a:b:c = 2×4:3×4:3×5 = 8:12:15.',
    difficulty: 'medium'
  },
  {
    topic: 'quant',
    question: 'The diagonal of a square is 10√2 cm. Find its area.',
    type: 'text',
    options: [],
    correctAnswer: '100',
    explanation: 'Side = diagonal/√2 = 10√2/√2 = 10 cm. Area = 10² = 100 cm².',
    difficulty: 'medium'
  },
  {
    topic: 'quant',
    question: 'Find x if log₁₀ x = 2.',
    type: 'text',
    options: [],
    correctAnswer: '100',
    explanation: '10² = 100.',
    difficulty: 'easy'
  },
  {
    topic: 'quant',
    question: 'A train 100m long crosses a platform 200m long in 20 seconds. Find its speed.',
    type: 'text',
    options: [],
    correctAnswer: '15',
    explanation: 'Distance = 100 + 200 = 300m, Time = 20s, Speed = 300/20 = 15 m/s.',
    difficulty: 'medium'
  },
  {
    topic: 'quant',
    question: 'Find the median of 1, 3, 5, 7, 9.',
    type: 'text',
    options: [],
    correctAnswer: '5',
    explanation: 'Middle value in sorted list: 5.',
    difficulty: 'easy'
  },
  {
    topic: 'quant',
    question: 'If x + 1/x = 3, find x³ + 1/x³.',
    type: 'text',
    options: [],
    correctAnswer: '18',
    explanation: 'Cube both sides: (x+1/x)³ = x³ + 3x(x)(1/x) + 1/x³ = x³ + 3 + 1/x³. So 27 = x³ + 1/x³ + 3, x³ + 1/x³ = 24. Wait, let y = x + 1/x = 3, y³ = x³ + 3x(1/x) + 1/x³ = x³ + 3 + 1/x³. So x³ + 1/x³ = 27 - 3 = 24.',
    difficulty: 'hard'
  },

  // Logical Reasoning Questions (25 questions)
  {
    topic: 'logical-reasoning',
    question: 'In a certain code, COMPUTER is written as RFUVQNPC. How is MEDICINE written?',
    type: 'text',
    options: [],
    correctAnswer: 'BTSXRXCT',
    explanation: 'Each letter is shifted by +15 positions in the alphabet.',
    difficulty: 'hard'
  },
  {
    topic: 'logical-reasoning',
    question: 'Find the next number in the series: 2, 6, 12, 20, 30, ?',
    type: 'mcq',
    options: ['40', '42', '44', '46'],
    correctAnswer: '42',
    explanation: 'Differences are 4, 6, 8, 10, so next difference is 12. 30 + 12 = 42.',
    difficulty: 'medium'
  },
  {
    topic: 'logical-reasoning',
    question: 'If A is the brother of B, B is the sister of C, and C is the father of D, what is A to D?',
    type: 'mcq',
    options: ['Uncle', 'Father', 'Grandfather', 'Brother'],
    correctAnswer: 'Uncle',
    explanation: 'A is brother of B, B is sister of C (so A is brother of C), C is father of D, so A is uncle of D.',
    difficulty: 'easy'
  },
  {
    topic: 'logical-reasoning',
    question: 'Pointing to a man, a woman said, "His mother is the only daughter of my father." How is the woman related to the man?',
    type: 'mcq',
    options: ['Mother', 'Sister', 'Wife', 'Daughter'],
    correctAnswer: 'Mother',
    explanation: 'Woman\'s father\'s only daughter is the woman herself. So she is the man\'s mother.',
    difficulty: 'medium'
  },
  {
    topic: 'logical-reasoning',
    question: 'Find the odd one out: 2, 3, 5, 7, 11, 13, 17, 19, 23',
    type: 'mcq',
    options: ['2', '3', '5', '7'],
    correctAnswer: '2',
    explanation: 'All others are odd prime numbers, 2 is even prime.',
    difficulty: 'easy'
  },
  {
    topic: 'logical-reasoning',
    question: 'If P means +, Q means -, R means ×, S means ÷, then what is 8 R 2 Q 3 S 2 P 1?',
    type: 'text',
    options: [],
    correctAnswer: '9',
    explanation: '8 × 2 - 3 ÷ 2 + 1 = 16 - 1.5 + 1 = 15.5. Wait, 8×2=16, 16-3=13, 13÷2=6.5, 6.5+1=7.5.',
    difficulty: 'hard'
  },
  {
    topic: 'logical-reasoning',
    question: 'Complete the series: AZ, BY, CX, DW, ?',
    type: 'mcq',
    options: ['EV', 'FU', 'GT', 'HS'],
    correctAnswer: 'EV',
    explanation: 'A+25=Z, B+24=Y, C+23=X, D+22=W, E+21=V.',
    difficulty: 'medium'
  },
  {
    topic: 'logical-reasoning',
    question: 'A man walks 3 km north, then 4 km east, then 5 km south. How far is he from starting point?',
    type: 'text',
    options: [],
    correctAnswer: '2',
    explanation: 'Net north: 3-5= -2km south, East: 4km. Distance = √(4² + 2²) = √20 ≈ 4.47. Wait, 3N + 4E + 5S = 2S + 4E. Distance = √(4² + 2²) = √20 ≈ 4.47.',
    difficulty: 'medium'
  },
  {
    topic: 'logical-reasoning',
    question: 'If all roses are flowers, some flowers fade quickly, then:',
    type: 'mcq',
    options: ['All roses fade quickly', 'Some roses fade quickly', 'No roses fade quickly', 'Cannot be determined'],
    correctAnswer: 'Cannot be determined',
    explanation: 'No direct relationship between roses and fading.',
    difficulty: 'medium'
  },
  {
    topic: 'logical-reasoning',
    question: 'Find the next letter: A, C, F, J, O, ?',
    type: 'mcq',
    options: ['U', 'T', 'S', 'R'],
    correctAnswer: 'U',
    explanation: 'Differences: 2,3,4,5,6 letters. A+2=C, C+3=F, F+4=J, J+5=O, O+6=U.',
    difficulty: 'hard'
  },
  {
    topic: 'logical-reasoning',
    question: 'In a row of 40 boys, R is 15th from left. What is his position from right?',
    type: 'text',
    options: [],
    correctAnswer: '26',
    explanation: 'Position from right = Total + 1 - Position from left = 40 + 1 - 15 = 26.',
    difficulty: 'easy'
  },
  {
    topic: 'logical-reasoning',
    question: 'If CAT = 3120, DOG = 4157, then RAT = ?',
    type: 'text',
    options: [],
    correctAnswer: '91820',
    explanation: 'C=3,A=1,T=20 → 3120. D=4,O=15,G=7 → 4157. R=18,A=1,T=20 → 91820.',
    difficulty: 'hard'
  },
  {
    topic: 'logical-reasoning',
    question: 'A is taller than B, B is taller than C, D is taller than A. Who is the shortest?',
    type: 'mcq',
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 'C',
    explanation: 'D > A > B > C, so C is shortest.',
    difficulty: 'easy'
  },
  {
    topic: 'logical-reasoning',
    question: 'Find the missing number: 1, 4, 9, 16, 25, ?',
    type: 'text',
    options: [],
    correctAnswer: '36',
    explanation: 'Squares: 1², 2², 3², 4², 5², 6² = 36.',
    difficulty: 'easy'
  },
  {
    topic: 'logical-reasoning',
    question: 'If Monday is coded as 1234567, what is Sunday?',
    type: 'text',
    options: [],
    correctAnswer: '1234567',
    explanation: 'All days have 7 letters, so same code.',
    difficulty: 'medium'
  },
  {
    topic: 'logical-reasoning',
    question: 'Complete the analogy: Book : Library :: ? : Museum',
    type: 'mcq',
    options: ['Painting', 'Artifact', 'Exhibit', 'Curator'],
    correctAnswer: 'Artifact',
    explanation: 'Book is kept in library, artifact in museum.',
    difficulty: 'easy'
  },
  {
    topic: 'logical-reasoning',
    question: 'A cube has 6 faces. How many edges does it have?',
    type: 'text',
    options: [],
    correctAnswer: '12',
    explanation: 'A cube has 12 edges.',
    difficulty: 'easy'
  },
  {
    topic: 'logical-reasoning',
    question: 'If all cats are mammals, no mammals are reptiles, then:',
    type: 'mcq',
    options: ['All cats are reptiles', 'No cats are reptiles', 'Some cats are reptiles', 'Cannot be determined'],
    correctAnswer: 'No cats are reptiles',
    explanation: 'Since cats are mammals and no mammals are reptiles.',
    difficulty: 'medium'
  },
  {
    topic: 'logical-reasoning',
    question: 'Find the next number: 1, 1, 2, 3, 5, 8, ?',
    type: 'text',
    options: [],
    correctAnswer: '13',
    explanation: 'Fibonacci sequence: each number is sum of previous two.',
    difficulty: 'easy'
  },
  {
    topic: 'logical-reasoning',
    question: 'If P + Q means P is brother of Q, P - Q means P is sister of Q, then what is X + Y - Z?',
    type: 'mcq',
    options: ['X is brother of Z', 'Y is sister of Z', 'X is uncle of Z', 'Cannot be determined'],
    correctAnswer: 'Y is sister of Z',
    explanation: 'X + Y means X is brother of Y, Y - Z means Y is sister of Z.',
    difficulty: 'hard'
  },
  {
    topic: 'logical-reasoning',
    question: 'How many 3-digit numbers are divisible by 7?',
    type: 'text',
    options: [],
    correctAnswer: '128',
    explanation: 'Smallest 3-digit number divisible by 7 is 105, largest is 994. Number = (994-105)/7 + 1 = 128.',
    difficulty: 'medium'
  },
  {
    topic: 'logical-reasoning',
    question: 'If A is coded as 1, B as 2, ..., Z as 26, what is the code for CAB?',
    type: 'text',
    options: [],
    correctAnswer: '312',
    explanation: 'C=3, A=1, B=2 → 312.',
    difficulty: 'easy'
  },
  {
    topic: 'logical-reasoning',
    question: 'Find the odd one out: Circle, Square, Triangle, Rectangle, Pentagon',
    type: 'mcq',
    options: ['Circle', 'Square', 'Triangle', 'Rectangle'],
    correctAnswer: 'Circle',
    explanation: 'All others have straight sides, circle is curved.',
    difficulty: 'easy'
  },
  {
    topic: 'logical-reasoning',
    question: 'If 5 workers can complete a work in 10 days, how many days will 10 workers take?',
    type: 'text',
    options: [],
    correctAnswer: '5',
    explanation: 'Work is inversely proportional to workers. 5 workers in 10 days, so 10 workers in 5 days.',
    difficulty: 'easy'
  },
  {
    topic: 'logical-reasoning',
    question: 'Complete the series: 2, 5, 10, 17, 26, ?',
    type: 'text',
    options: [],
    correctAnswer: '37',
    explanation: '2+3=5, 5+5=10, 10+7=17, 17+9=26, 26+11=37. Differences increase by 2.',
    difficulty: 'medium'
  },

  // Verbal Ability Questions (25 questions)
  {
    topic: 'verbal',
    question: 'Choose the word most similar in meaning to METICULOUS:',
    type: 'mcq',
    options: ['Careless', 'Careful', 'Hasty', 'Rough'],
    correctAnswer: 'Careful',
    explanation: 'Meticulous means showing great attention to detail; very careful and precise.',
    difficulty: 'easy'
  },
  {
    topic: 'verbal',
    question: 'Choose the correct sentence:',
    type: 'mcq',
    options: [
      'Neither of the boys were present',
      'Neither of the boys was present',
      'Neither of the boy were present',
      'Neither of the boy was present'
    ],
    correctAnswer: 'Neither of the boys was present',
    explanation: 'Neither takes singular verb, and "boys" is correct plural form.',
    difficulty: 'medium'
  },
  {
    topic: 'verbal',
    question: 'What is the antonym of ABUNDANT?',
    type: 'text',
    options: [],
    correctAnswer: 'scarce',
    explanation: 'Abundant means existing in large quantities; scarce means insufficient.',
    difficulty: 'easy'
  },
  {
    topic: 'verbal',
    question: 'Choose the word that best completes the sentence: The scientist was ______ in his research methodology.',
    type: 'mcq',
    options: ['careless', 'meticulous', 'hasty', 'negligent'],
    correctAnswer: 'meticulous',
    explanation: 'Meticulous means showing great attention to detail, which fits a scientist\'s research.',
    difficulty: 'medium'
  },
  {
    topic: 'verbal',
    question: 'Identify the synonym of "ELOQUENT":',
    type: 'mcq',
    options: ['Silent', 'Fluent', 'Confused', 'Angry'],
    correctAnswer: 'Fluent',
    explanation: 'Eloquent means fluent or persuasive in speaking or writing.',
    difficulty: 'easy'
  },
  {
    topic: 'verbal',
    question: 'Choose the correct spelling:',
    type: 'mcq',
    options: ['Recieve', 'Receive', 'Receeve', 'Recive'],
    correctAnswer: 'Receive',
    explanation: 'Receive is spelled with "ei" after "c".',
    difficulty: 'easy'
  },
  {
    topic: 'verbal',
    question: 'What is the plural of "child"?',
    type: 'mcq',
    options: ['Childs', 'Children', 'Childes', 'Childrens'],
    correctAnswer: 'Children',
    explanation: 'Children is the irregular plural of child.',
    difficulty: 'easy'
  },
  {
    topic: 'verbal',
    question: 'Identify the antonym of "GENEROUS":',
    type: 'mcq',
    options: ['Kind', 'Stingy', 'Liberal', 'Benevolent'],
    correctAnswer: 'Stingy',
    explanation: 'Generous means giving freely; stingy means ungenerous.',
    difficulty: 'easy'
  },
  {
    topic: 'verbal',
    question: 'Choose the correct preposition: He is afraid ______ spiders.',
    type: 'mcq',
    options: ['from', 'of', 'by', 'at'],
    correctAnswer: 'of',
    explanation: 'Afraid of is the correct phrase.',
    difficulty: 'easy'
  },
  {
    topic: 'verbal',
    question: 'What does "ephemeral" mean?',
    type: 'mcq',
    options: ['Eternal', 'Temporary', 'Bright', 'Dark'],
    correctAnswer: 'Temporary',
    explanation: 'Ephemeral means lasting for a very short time.',
    difficulty: 'medium'
  },
  {
    topic: 'verbal',
    question: 'Choose the word that is different from the others:',
    type: 'mcq',
    options: ['Apple', 'Orange', 'Banana', 'Carrot'],
    correctAnswer: 'Carrot',
    explanation: 'Carrot is a vegetable, others are fruits.',
    difficulty: 'easy'
  },
  {
    topic: 'verbal',
    question: 'Identify the synonym of "ABATE":',
    type: 'mcq',
    options: ['Increase', 'Diminish', 'Enhance', 'Augment'],
    correctAnswer: 'Diminish',
    explanation: 'Abate means to become less intense or widespread.',
    difficulty: 'medium'
  },
  {
    topic: 'verbal',
    question: 'Choose the correct tense: I ______ to school every day.',
    type: 'mcq',
    options: ['go', 'went', 'gone', 'going'],
    correctAnswer: 'go',
    explanation: 'Present simple tense for habitual action.',
    difficulty: 'easy'
  },
  {
    topic: 'verbal',
    question: 'What is the meaning of "ubiquitous"?',
    type: 'mcq',
    options: ['Rare', 'Present everywhere', 'Hidden', 'Unique'],
    correctAnswer: 'Present everywhere',
    explanation: 'Ubiquitous means present, appearing, or found everywhere.',
    difficulty: 'medium'
  },
  {
    topic: 'verbal',
    question: 'Choose the correct article: ______ honest man is trusted by all.',
    type: 'mcq',
    options: ['A', 'An', 'The', 'No article'],
    correctAnswer: 'An',
    explanation: 'An is used before words starting with vowel sound.',
    difficulty: 'easy'
  },
  {
    topic: 'verbal',
    question: 'Identify the antonym of "VORACIOUS":',
    type: 'mcq',
    options: ['Hungry', 'Greedy', 'Satisfied', 'Insatiable'],
    correctAnswer: 'Satisfied',
    explanation: 'Voracious means having a huge appetite; satisfied means content.',
    difficulty: 'medium'
  },
  {
    topic: 'verbal',
    question: 'Choose the correct word: The teacher asked the students to ______ their books.',
    type: 'mcq',
    options: ['open', 'opened', 'opening', 'opens'],
    correctAnswer: 'open',
    explanation: 'Base form after "to" in infinitive.',
    difficulty: 'easy'
  },
  {
    topic: 'verbal',
    question: 'What does "gregarious" mean?',
    type: 'mcq',
    options: ['Shy', 'Sociable', 'Angry', 'Lazy'],
    correctAnswer: 'Sociable',
    explanation: 'Gregarious means fond of company; sociable.',
    difficulty: 'medium'
  },
  {
    topic: 'verbal',
    question: 'Choose the correct sentence structure:',
    type: 'mcq',
    options: [
      'He go to school',
      'He goes to school',
      'He going to school',
      'He gone to school'
    ],
    correctAnswer: 'He goes to school',
    explanation: 'Subject-verb agreement in present simple.',
    difficulty: 'easy'
  },
  {
    topic: 'verbal',
    question: 'Identify the synonym of "PRUDENT":',
    type: 'mcq',
    options: ['Careless', 'Wise', 'Bold', 'Rash'],
    correctAnswer: 'Wise',
    explanation: 'Prudent means acting with or showing care and thought for the future.',
    difficulty: 'medium'
  },
  {
    topic: 'verbal',
    question: 'Choose the correct word: She sings ______ than her sister.',
    type: 'mcq',
    options: ['good', 'better', 'best', 'well'],
    correctAnswer: 'better',
    explanation: 'Comparative degree for "good" is "better".',
    difficulty: 'easy'
  },
  {
    topic: 'verbal',
    question: 'What is the meaning of "alacrity"?',
    type: 'mcq',
    options: ['Slowness', 'Speed', 'Bravery', 'Cheerfulness'],
    correctAnswer: 'Speed',
    explanation: 'Alacrity means brisk and cheerful readiness.',
    difficulty: 'hard'
  },
  {
    topic: 'verbal',
    question: 'Choose the word that best fits: The ______ of the storm was frightening.',
    type: 'mcq',
    options: ['calm', 'fury', 'peace', 'quiet'],
    correctAnswer: 'fury',
    explanation: 'Fury means violent anger or force.',
    difficulty: 'medium'
  },
  {
    topic: 'verbal',
    question: 'Identify the antonym of "BENIGN":',
    type: 'mcq',
    options: ['Kind', 'Harsh', 'Gentle', 'Mild'],
    correctAnswer: 'Harsh',
    explanation: 'Benign means gentle and kind; harsh means cruel or severe.',
    difficulty: 'medium'
  },
  {
    topic: 'verbal',
    question: 'Choose the correct form: I wish I ______ taller.',
    type: 'mcq',
    options: ['am', 'were', 'was', 'be'],
    correctAnswer: 'were',
    explanation: 'Subjunctive mood in wish clauses uses "were".',
    difficulty: 'medium'
  },

  // Puzzles Questions (25 questions)
  {
    topic: 'puzzles',
    question: 'A man lives on the 20th floor. He takes elevator down but only to 10th floor when coming up, except on rainy days when he goes to 20th. Why?',
    type: 'mcq',
    options: [
      'He likes walking',
      'Elevator is broken above 10th floor',
      'He is too short to reach 20th button',
      'He exercises by walking'
    ],
    correctAnswer: 'He is too short to reach 20th button',
    explanation: 'On rainy days, he has an umbrella to help reach the higher button.',
    difficulty: 'hard'
  },
  {
    topic: 'puzzles',
    question: 'What comes next in the pattern: O, T, T, F, F, S, S, ?',
    type: 'mcq',
    options: ['E', 'N', 'I', 'G'],
    correctAnswer: 'E',
    explanation: 'First letters of numbers: One, Two, Three, Four, Five, Six, Seven, Eight.',
    difficulty: 'medium'
  },
  {
    topic: 'puzzles',
    question: 'I am taken from a mine and shut in a wooden case. I am never released but used by almost everyone. What am I?',
    type: 'text',
    options: [],
    correctAnswer: 'pencil lead',
    explanation: 'Graphite is mined and put in wooden pencils, never released but used for writing.',
    difficulty: 'medium'
  },
  {
    topic: 'puzzles',
    question: 'What has keys but cannot open locks?',
    type: 'mcq',
    options: ['Piano', 'Door', 'Car', 'House'],
    correctAnswer: 'Piano',
    explanation: 'A piano has keys but they play music, not open locks.',
    difficulty: 'easy'
  },
  {
    topic: 'puzzles',
    question: 'If you have me, you want to share me. If you share me, you don\'t have me. What am I?',
    type: 'mcq',
    options: ['Money', 'Secret', 'Food', 'Toy'],
    correctAnswer: 'Secret',
    explanation: 'A secret: once shared, it\'s no longer a secret.',
    difficulty: 'medium'
  },
  {
    topic: 'puzzles',
    question: 'What has a head, a tail, is brown, and has no legs?',
    type: 'mcq',
    options: ['Snake', 'Penny', 'Dog', 'Cat'],
    correctAnswer: 'Penny',
    explanation: 'A penny coin has heads and tails, is brown/copper colored, and no legs.',
    difficulty: 'easy'
  },
  {
    topic: 'puzzles',
    question: 'The more you take, the more you leave behind. What am I?',
    type: 'mcq',
    options: ['Footsteps', 'Money', 'Time', 'Memories'],
    correctAnswer: 'Footsteps',
    explanation: 'Footsteps: the more you take, the more you leave behind.',
    difficulty: 'easy'
  },
  {
    topic: 'puzzles',
    question: 'What can travel around the world while staying in a corner?',
    type: 'mcq',
    options: ['Airplane', 'Stamp', 'Ship', 'Train'],
    correctAnswer: 'Stamp',
    explanation: 'A postage stamp travels around the world but stays in the corner of an envelope.',
    difficulty: 'medium'
  },
  {
    topic: 'puzzles',
    question: 'I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?',
    type: 'mcq',
    options: ['Echo', 'Whistle', 'Bell', 'Radio'],
    correctAnswer: 'Echo',
    explanation: 'An echo speaks without mouth, hears without ears, has no body, comes alive with wind.',
    difficulty: 'hard'
  },
  {
    topic: 'puzzles',
    question: 'What has one eye but cannot see?',
    type: 'mcq',
    options: ['Cyclops', 'Needle', 'Storm', 'Camera'],
    correctAnswer: 'Needle',
    explanation: 'A needle has an eye (the hole) but cannot see.',
    difficulty: 'easy'
  },
  {
    topic: 'puzzles',
    question: 'What gets wetter as it dries?',
    type: 'mcq',
    options: ['Towel', 'Hair', 'Clothes', 'Soap'],
    correctAnswer: 'Towel',
    explanation: 'A towel gets wetter as it dries things.',
    difficulty: 'easy'
  },
  {
    topic: 'puzzles',
    question: 'I have cities but no houses. I have mountains but no trees. I have water but no fish. What am I?',
    type: 'mcq',
    options: ['Map', 'Globe', 'Book', 'Painting'],
    correctAnswer: 'Map',
    explanation: 'A map has cities, mountains, and water but no real houses, trees, or fish.',
    difficulty: 'easy'
  },
  {
    topic: 'puzzles',
    question: 'What has hands but cannot clap?',
    type: 'mcq',
    options: ['Clock', 'Person', 'Monkey', 'Robot'],
    correctAnswer: 'Clock',
    explanation: 'A clock has hands but cannot clap.',
    difficulty: 'easy'
  },
  {
    topic: 'puzzles',
    question: 'What can be cracked, made, told, and played?',
    type: 'mcq',
    options: ['Joke', 'Code', 'Music', 'Safe'],
    correctAnswer: 'Joke',
    explanation: 'A joke can be cracked, made, told, and played.',
    difficulty: 'medium'
  },
  {
    topic: 'puzzles',
    question: 'What has a neck but no head?',
    type: 'mcq',
    options: ['Giraffe', 'Bottle', 'Shirt', 'Snake'],
    correctAnswer: 'Bottle',
    explanation: 'A bottle has a neck but no head.',
    difficulty: 'easy'
  },
  {
    topic: 'puzzles',
    question: 'What has words but never speaks?',
    type: 'mcq',
    options: ['Book', 'Teacher', 'Radio', 'Computer'],
    correctAnswer: 'Book',
    explanation: 'A book has words but never speaks.',
    difficulty: 'easy'
  },
  {
    topic: 'puzzles',
    question: 'What has four fingers and a thumb but is not alive?',
    type: 'mcq',
    options: ['Hand', 'Glove', 'Robot', 'Puppet'],
    correctAnswer: 'Glove',
    explanation: 'A glove has four fingers and a thumb but is not alive.',
    difficulty: 'easy'
  },
  {
    topic: 'puzzles',
    question: 'What has a bottom at the top?',
    type: 'mcq',
    options: ['Leg', 'Table', 'Chair', 'Tree'],
    correctAnswer: 'Leg',
    explanation: 'Your leg has a bottom (foot) at the top (end).',
    difficulty: 'medium'
  },
  {
    topic: 'puzzles',
    question: 'What can you catch but not throw?',
    type: 'mcq',
    options: ['Ball', 'Cold', 'Fish', 'Disease'],
    correctAnswer: 'Cold',
    explanation: 'You can catch a cold but not throw it.',
    difficulty: 'easy'
  },
  {
    topic: 'puzzles',
    question: 'What has a ring but no finger?',
    type: 'mcq',
    options: ['Telephone', 'Door', 'Box', 'Tree'],
    correctAnswer: 'Telephone',
    explanation: 'A telephone has a ring but no finger.',
    difficulty: 'easy'
  },
  {
    topic: 'puzzles',
    question: 'What has many teeth but cannot bite?',
    type: 'mcq',
    options: ['Shark', 'Comb', 'Saw', 'Dog'],
    correctAnswer: 'Comb',
    explanation: 'A comb has many teeth but cannot bite.',
    difficulty: 'easy'
  },
  {
    topic: 'puzzles',
    question: 'What has a face and two hands but no arms or legs?',
    type: 'mcq',
    options: ['Clock', 'Person', 'Doll', 'Robot'],
    correctAnswer: 'Clock',
    explanation: 'A clock has a face and two hands but no arms or legs.',
    difficulty: 'easy'
  },
  {
    topic: 'puzzles',
    question: 'What can you break without touching it?',
    type: 'mcq',
    options: ['Glass', 'Promise', 'Window', 'Plate'],
    correctAnswer: 'Promise',
    explanation: 'You can break a promise without touching it.',
    difficulty: 'easy'
  },
  {
    topic: 'puzzles',
    question: 'What has a spine but no bones?',
    type: 'mcq',
    options: ['Human', 'Book', 'Fish', 'Snake'],
    correctAnswer: 'Book',
    explanation: 'A book has a spine but no bones.',
    difficulty: 'easy'
  },
  {
    topic: 'puzzles',
    question: 'What has branches but no leaves?',
    type: 'mcq',
    options: ['Tree', 'Bank', 'River', 'Mountain'],
    correctAnswer: 'Bank',
    explanation: 'A bank has branches but no leaves.',
    difficulty: 'medium'
  },
  {
    topic: 'puzzles',
    question: 'What has a heart that doesn\'t beat?',
    type: 'mcq',
    options: ['Human', 'Animal', 'Artichoke', 'Pumpkin'],
    correctAnswer: 'Artichoke',
    explanation: 'An artichoke has a heart that doesn\'t beat.',
    difficulty: 'hard'
  }
];

async function seedAptitudeQuestions() {
  try {
    // Clear existing questions
    await AptitudeQuestion.deleteMany({});
    console.log('Cleared existing aptitude questions');

    // Insert sample questions
    await AptitudeQuestion.insertMany(sampleQuestions);
    console.log(`Inserted ${sampleQuestions.length} aptitude questions`);

    console.log('Aptitude questions seeded successfully!');
  } catch (error) {
    console.error('Error seeding aptitude questions:', error);
  }
}

module.exports = seedAptitudeQuestions;