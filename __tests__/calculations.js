import assert from 'assert';
import { percentageToColor, getAverageScore, getSquashedScore } from '../lib/calculations';

describe('test calculations', () => {
  describe('the colors are returned as expected', () => {
    it('should return brightgreen for very high number', async () => {
      assert.equal('brightgreen', await percentageToColor(97));
    });

    it('should return green for high number', async () => {
      assert.equal('green', await percentageToColor(92));
    });

    it('should return yellowgreen for medium high number', async () => {
      assert.equal('yellowgreen', await percentageToColor(85));
    });

    it('should return yellow for medium number', async () => {
      assert.equal('yellow', await percentageToColor(62));
    });

    it('should return orange for low number', async () => {
      assert.equal('orange', await percentageToColor(45));
    });

    it('should return red for very low number', async () => {
      assert.equal('red', await percentageToColor(23));
    });
  });

  describe('the average is calculated correctly', () => {
    it('should contain the expected average', async () => {
      const expectedResult = { 'lighthouse accessibility': 60, 'lighthouse performance': 51 };
      const input = [
        { 'lighthouse accessibility': 100, 'lighthouse performance': 52 },
        { 'lighthouse accessibility': 20, 'lighthouse performance': 50 },
      ];
      const actualResult = await getAverageScore(input);
      assert.deepEqual(expectedResult, actualResult);
    });

    it('should round the expected average correctly', async () => {
      const expectedResult = {
        'lighthouse accessibility': 99,
        'lighthouse performance': 99,
        'lighthouse progressive web app': 99,
        'lighthouse best practices': 99,
      };
      const input = [{
        'lighthouse accessibility': 100,
        'lighthouse performance': 100,
        'lighthouse progressive web app': 100,
        'lighthouse best practices': 100,
      }, {
        'lighthouse accessibility': 98.9,
        'lighthouse performance': 98.9,
        'lighthouse progressive web app': 98.9,
        'lighthouse best practices': 98.9,
      }];
      const actualResult = await getAverageScore(input);
      assert.deepEqual(expectedResult, actualResult);
    });
  });

  describe('the average is calculated correctly for squashed score', () => {
    it('should contain the expected squashed average', async () => {
      const expectedResult = { lighthouse: 50 };
      const input = [
        { 'lighthouse accessibility': 100, 'lighthouse performance': 60 },
        { 'lighthouse accessibility': 20, 'lighthouse performance': 20 },
      ];
      const actualResult = await getSquashedScore(input);
      assert.deepEqual(expectedResult, actualResult);
    });

    it('should round the expected squashed average correctly', async () => {
      const expectedResult = { lighthouse: 83 };
      const input = [{
        'lighthouse accessibility': 100,
        'lighthouse performance': 100,
        'lighthouse progressive web app': 55,
        'lighthouse best practices': 75,
      }];
      const actualResult = await getSquashedScore(input);
      assert.deepEqual(expectedResult, actualResult);
    });
  });
});
