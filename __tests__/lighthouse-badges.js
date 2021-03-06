import assert from 'assert';
import fs from 'fs';
import ReportGenerator from 'lighthouse/lighthouse-core/report/report-generator';
import { htmlReportsToFile, metricsToSvg, processRawLighthouseResult } from '../lib/lighthouse-badges';
import { zip } from '../lib/util';
import { parser } from '../lib/argparser';

const lighthouseBadges = require('../lib/lighthouse-badges');
const reportFixture = require('../assets/report/emanuelemazzotta.com.json');


describe('test lighthouse badges', () => {
  describe('the lighthouse command results are processed as expected', () => {
    it('should return correct metrics and no report', async () => {
      const url = 'https://emanuelemazzotta.com';
      const shouldSaveReport = false;
      const result = await processRawLighthouseResult(
        reportFixture, url, shouldSaveReport,
      );
      assert.deepEqual({
        metrics: {
          'lighthouse performance': 98,
          'lighthouse pwa': 85,
          'lighthouse accessibility': 100,
          'lighthouse best-practices': 93,
          'lighthouse seo': 100,
        },
        report: {
          [url]: false,
        },
      }, result);
    });

    it('should return correct metrics and a valid report', async () => {
      const expectedHtmlReport = ReportGenerator.generateReportHtml(reportFixture);
      const url = 'https://emanuelemazzotta.com';
      const shouldSaveReport = true;
      const result = await processRawLighthouseResult(
        reportFixture, url, shouldSaveReport,
      );
      assert.deepEqual({
        metrics: {
          'lighthouse performance': 98,
          'lighthouse pwa': 85,
          'lighthouse accessibility': 100,
          'lighthouse best-practices': 93,
          'lighthouse seo': 100,
        },
        report: {
          [url]: expectedHtmlReport,
        },
      }, result);
    });
  });

  describe('the html reports are saved correctly', () => {
    let output;
    const { writeFile } = fs;

    beforeEach(() => {
      output = [];
      fs.writeFile = (path, content) => {
        output.push({ [path]: content });
      };
    });

    afterEach(() => {
      fs.writeFile = writeFile;
    });

    it('should save html report', async () => {
      const htmlReports = [
        { 'https://emanuelemazzotta.com': 'a report' },
        { 'https://emanuelemazzotta.com/cv': 'another report' },
      ];
      await htmlReportsToFile(htmlReports);

      zip([output, htmlReports]).map((items) => {
        const [actual, expected] = items;
        return assert.deepEqual(Object.values(actual), Object.values(expected));
      });

      assert.equal(output.length, 2);
    });

    it('should not save html report if toggle is false', async () => {
      const htmlReports = [false, false];
      await htmlReportsToFile(htmlReports);
      assert.equal(output.length, 0);
    });
  });

  describe('the svg files are saved correctly', () => {
    let output;
    const { writeFile } = fs;

    beforeEach(() => {
      output = [];
      fs.writeFile = (path, content) => {
        output.push({ [path]: content });
      };
    });

    afterEach(() => {
      fs.writeFile = writeFile;
    });

    it('should save all svg files', async () => {
      const lighthouseMetrics = {
        'lighthouse performance': 100,
        'lighthouse pwa': 85,
        'lighthouse accessibility': 100,
        'lighthouse best-practices': 93,
        'lighthouse seo': 100,
      };

      const badgeStyle = 'flat';
      await metricsToSvg(lighthouseMetrics, badgeStyle);

      assert.equal(output.length, 5);
    });
  });

  describe('test the main process function', () => {
    let output;
    const { writeFile } = fs;

    beforeEach(() => {
      output = [];
      fs.writeFile = (path, content) => {
        output.push({ [path]: content });
      };
    });

    afterEach(() => {
      fs.writeFile = writeFile;
    });

    it('should create single badge with report', async () => {
      const args = parser.parseArgs([
        '--single-badge',
        '--save-report',
        '--urls', 'https://example.org',
      ]);
      const getLighthouseMetrics = jest.fn();
      getLighthouseMetrics.mockReturnValue(await processRawLighthouseResult(reportFixture, 'https://example.org', args.save_report));
      await lighthouseBadges.processParameters(args, getLighthouseMetrics);

      assert.equal(output.length, 2);
    });

    it('should create multiple badges with report', async () => {
      const args = parser.parseArgs([
        '--save-report',
        '--urls', 'https://example.org',
      ]);
      const getLighthouseMetrics = jest.fn();
      getLighthouseMetrics.mockReturnValue(await processRawLighthouseResult(reportFixture, 'https://example.org', args.save_report));
      await lighthouseBadges.processParameters(args, getLighthouseMetrics);

      assert.equal(output.length, 6);
    });

    it('should create single badge without report', async () => {
      const args = parser.parseArgs([
        '--single-badge',
        '--urls', 'https://example.org',
      ]);
      const getLighthouseMetrics = jest.fn();
      getLighthouseMetrics.mockReturnValue(await processRawLighthouseResult(reportFixture, 'https://example.org', args.save_report));
      await lighthouseBadges.processParameters(args, getLighthouseMetrics);

      assert.equal(output.length, 1);
    });

    it('should create multiple badges without report', async () => {
      const args = parser.parseArgs([
        '--urls', 'https://example.org',
      ]);
      const getLighthouseMetrics = jest.fn();
      getLighthouseMetrics.mockReturnValue(await processRawLighthouseResult(reportFixture, 'https://example.org', args.save_report));
      await lighthouseBadges.processParameters(args, getLighthouseMetrics);

      assert.equal(output.length, 5);
    });
  });
});
