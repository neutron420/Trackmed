import { Router } from 'express';
import type { Request, Response } from 'express';
import {
  createReport,
  generateReportData,
  getReports,
  getReportById,
  deleteReport,
  getReportStats,
} from '../services/report.service';
import { ReportType, ReportStatus } from '@prisma/client';
import { optionalAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(optionalAuth);

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const result = await getReportStats();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: result.data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, status, page, limit } = req.query;
    const userId = (req as any).user?.userId;

    const result = await getReports({
      type: type as ReportType | undefined,
      status: status as ReportStatus | undefined,
      generatedBy: userId,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Report ID is required',
      });
    }

    const result = await getReportById(id as string);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: result.report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, type, parameters, format } = req.body;

    const validTypes: ReportType[] = [
      'PRODUCTION',
      'INVENTORY',
      'SALES',
      'QUALITY',
      'VERIFICATION',
      'EXPIRY',
      'DISTRIBUTOR',
      'BATCH_SUMMARY',
      'FRAUD_ANALYSIS',
    ];

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: 'Name and type are required',
      });
    }

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid report type',
      });
    }

    const userId = (req as any).user?.userId || 'system';

    const createResult = await createReport({
      name,
      type,
      parameters,
      format,
      generatedBy: userId,
    });

    if (!createResult.success) {
      return res.status(400).json({
        success: false,
        error: createResult.error,
      });
    }

    const generateResult = await generateReportData(createResult.report!.id);

    if (!generateResult.success) {
      return res.status(500).json({
        success: false,
        error: generateResult.error,
        report: createResult.report,
      });
    }

    res.status(201).json({
      success: true,
      data: {
        report: generateResult.report,
        reportData: generateResult.data,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

router.post('/:id/regenerate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await generateReportData(id as string);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: {
        report: result.report,
        reportData: result.data,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

router.get('/:id/download', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const reportResult = await getReportById(id as string);

    if (!reportResult.success || !reportResult.report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found',
      });
    }

    if (reportResult.report.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: 'Report is not ready for download',
      });
    }

    const generateResult = await generateReportData(id as string);

    if (!generateResult.success) {
      return res.status(500).json({
        success: false,
        error: generateResult.error,
      });
    }

    const filename = `${reportResult.report.reportNumber}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.json(generateResult.data);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId || 'system';

    const result = await deleteReport(id as string, userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

router.post('/quick/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { parameters } = req.body;

    const validTypes: ReportType[] = [
      'PRODUCTION',
      'INVENTORY',
      'SALES',
      'QUALITY',
      'VERIFICATION',
      'EXPIRY',
      'DISTRIBUTOR',
      'BATCH_SUMMARY',
      'FRAUD_ANALYSIS',
    ];

    if (!validTypes.includes(type as ReportType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid report type',
      });
    }

    const userId = (req as any).user?.userId || 'system';
    const reportName = `${(type as string).replace(/_/g, ' ')} Report - ${new Date().toLocaleDateString()}`;

    const createResult = await createReport({
      name: reportName,
      type: type as ReportType,
      parameters,
      generatedBy: userId,
    });

    if (!createResult.success) {
      return res.status(400).json({
        success: false,
        error: createResult.error,
      });
    }

    const generateResult = await generateReportData(createResult.report!.id);

    if (!generateResult.success) {
      return res.status(500).json({
        success: false,
        error: generateResult.error,
      });
    }

    res.status(201).json({
      success: true,
      data: {
        report: generateResult.report,
        reportData: generateResult.data,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

export default router;
