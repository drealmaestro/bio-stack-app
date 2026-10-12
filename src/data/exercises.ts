import type { Exercise } from '../types';
import { EXERCISES_PART1 } from './exercisesPart1';
import { EXERCISES_PART2 } from './exercisesPart2';
import { EXERCISES_PART3 } from './exercisesPart3';

export const INITIAL_EXERCISES: Exercise[] = [
    ...EXERCISES_PART1,
    ...EXERCISES_PART2,
    ...EXERCISES_PART3
];
