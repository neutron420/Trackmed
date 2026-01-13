/**
 * This file exports the `ScanLog` model and its related types.
 *
 * 🟢 You can import this file directly.
 */
import * as runtime from "@prisma/client/runtime/library";
import type * as $Enums from "../enums";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model ScanLog
 *
 */
export type ScanLogModel = runtime.Types.Result.DefaultSelection<Prisma.$ScanLogPayload>;
export type AggregateScanLog = {
    _count: ScanLogCountAggregateOutputType | null;
    _avg: ScanLogAvgAggregateOutputType | null;
    _sum: ScanLogSumAggregateOutputType | null;
    _min: ScanLogMinAggregateOutputType | null;
    _max: ScanLogMaxAggregateOutputType | null;
};
export type ScanLogAvgAggregateOutputType = {
    locationLat: runtime.Decimal | null;
    locationLng: runtime.Decimal | null;
};
export type ScanLogSumAggregateOutputType = {
    locationLat: runtime.Decimal | null;
    locationLng: runtime.Decimal | null;
};
export type ScanLogMinAggregateOutputType = {
    id: string | null;
    qrCodeId: string | null;
    batchId: string | null;
    userId: string | null;
    deviceId: string | null;
    deviceModel: string | null;
    deviceOS: string | null;
    appVersion: string | null;
    locationLat: runtime.Decimal | null;
    locationLng: runtime.Decimal | null;
    locationAddress: string | null;
    scanType: $Enums.ScanType | null;
    blockchainVerified: boolean | null;
    blockchainStatus: string | null;
    createdAt: Date | null;
};
export type ScanLogMaxAggregateOutputType = {
    id: string | null;
    qrCodeId: string | null;
    batchId: string | null;
    userId: string | null;
    deviceId: string | null;
    deviceModel: string | null;
    deviceOS: string | null;
    appVersion: string | null;
    locationLat: runtime.Decimal | null;
    locationLng: runtime.Decimal | null;
    locationAddress: string | null;
    scanType: $Enums.ScanType | null;
    blockchainVerified: boolean | null;
    blockchainStatus: string | null;
    createdAt: Date | null;
};
export type ScanLogCountAggregateOutputType = {
    id: number;
    qrCodeId: number;
    batchId: number;
    userId: number;
    deviceId: number;
    deviceModel: number;
    deviceOS: number;
    appVersion: number;
    locationLat: number;
    locationLng: number;
    locationAddress: number;
    scanType: number;
    blockchainVerified: number;
    blockchainStatus: number;
    createdAt: number;
    _all: number;
};
export type ScanLogAvgAggregateInputType = {
    locationLat?: true;
    locationLng?: true;
};
export type ScanLogSumAggregateInputType = {
    locationLat?: true;
    locationLng?: true;
};
export type ScanLogMinAggregateInputType = {
    id?: true;
    qrCodeId?: true;
    batchId?: true;
    userId?: true;
    deviceId?: true;
    deviceModel?: true;
    deviceOS?: true;
    appVersion?: true;
    locationLat?: true;
    locationLng?: true;
    locationAddress?: true;
    scanType?: true;
    blockchainVerified?: true;
    blockchainStatus?: true;
    createdAt?: true;
};
export type ScanLogMaxAggregateInputType = {
    id?: true;
    qrCodeId?: true;
    batchId?: true;
    userId?: true;
    deviceId?: true;
    deviceModel?: true;
    deviceOS?: true;
    appVersion?: true;
    locationLat?: true;
    locationLng?: true;
    locationAddress?: true;
    scanType?: true;
    blockchainVerified?: true;
    blockchainStatus?: true;
    createdAt?: true;
};
export type ScanLogCountAggregateInputType = {
    id?: true;
    qrCodeId?: true;
    batchId?: true;
    userId?: true;
    deviceId?: true;
    deviceModel?: true;
    deviceOS?: true;
    appVersion?: true;
    locationLat?: true;
    locationLng?: true;
    locationAddress?: true;
    scanType?: true;
    blockchainVerified?: true;
    blockchainStatus?: true;
    createdAt?: true;
    _all?: true;
};
export type ScanLogAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ScanLog to aggregate.
     */
    where?: Prisma.ScanLogWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ScanLogs to fetch.
     */
    orderBy?: Prisma.ScanLogOrderByWithRelationInput | Prisma.ScanLogOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.ScanLogWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ScanLogs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ScanLogs.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned ScanLogs
    **/
    _count?: true | ScanLogCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: ScanLogAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: ScanLogSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: ScanLogMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: ScanLogMaxAggregateInputType;
};
export type GetScanLogAggregateType<T extends ScanLogAggregateArgs> = {
    [P in keyof T & keyof AggregateScanLog]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateScanLog[P]> : Prisma.GetScalarType<T[P], AggregateScanLog[P]>;
};
export type ScanLogGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ScanLogWhereInput;
    orderBy?: Prisma.ScanLogOrderByWithAggregationInput | Prisma.ScanLogOrderByWithAggregationInput[];
    by: Prisma.ScanLogScalarFieldEnum[] | Prisma.ScanLogScalarFieldEnum;
    having?: Prisma.ScanLogScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ScanLogCountAggregateInputType | true;
    _avg?: ScanLogAvgAggregateInputType;
    _sum?: ScanLogSumAggregateInputType;
    _min?: ScanLogMinAggregateInputType;
    _max?: ScanLogMaxAggregateInputType;
};
export type ScanLogGroupByOutputType = {
    id: string;
    qrCodeId: string;
    batchId: string;
    userId: string | null;
    deviceId: string | null;
    deviceModel: string | null;
    deviceOS: string | null;
    appVersion: string | null;
    locationLat: runtime.Decimal | null;
    locationLng: runtime.Decimal | null;
    locationAddress: string | null;
    scanType: $Enums.ScanType;
    blockchainVerified: boolean;
    blockchainStatus: string | null;
    createdAt: Date;
    _count: ScanLogCountAggregateOutputType | null;
    _avg: ScanLogAvgAggregateOutputType | null;
    _sum: ScanLogSumAggregateOutputType | null;
    _min: ScanLogMinAggregateOutputType | null;
    _max: ScanLogMaxAggregateOutputType | null;
};
type GetScanLogGroupByPayload<T extends ScanLogGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ScanLogGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ScanLogGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ScanLogGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ScanLogGroupByOutputType[P]>;
}>>;
export type ScanLogWhereInput = {
    AND?: Prisma.ScanLogWhereInput | Prisma.ScanLogWhereInput[];
    OR?: Prisma.ScanLogWhereInput[];
    NOT?: Prisma.ScanLogWhereInput | Prisma.ScanLogWhereInput[];
    id?: Prisma.StringFilter<"ScanLog"> | string;
    qrCodeId?: Prisma.StringFilter<"ScanLog"> | string;
    batchId?: Prisma.StringFilter<"ScanLog"> | string;
    userId?: Prisma.StringNullableFilter<"ScanLog"> | string | null;
    deviceId?: Prisma.StringNullableFilter<"ScanLog"> | string | null;
    deviceModel?: Prisma.StringNullableFilter<"ScanLog"> | string | null;
    deviceOS?: Prisma.StringNullableFilter<"ScanLog"> | string | null;
    appVersion?: Prisma.StringNullableFilter<"ScanLog"> | string | null;
    locationLat?: Prisma.DecimalNullableFilter<"ScanLog"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: Prisma.DecimalNullableFilter<"ScanLog"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: Prisma.StringNullableFilter<"ScanLog"> | string | null;
    scanType?: Prisma.EnumScanTypeFilter<"ScanLog"> | $Enums.ScanType;
    blockchainVerified?: Prisma.BoolFilter<"ScanLog"> | boolean;
    blockchainStatus?: Prisma.StringNullableFilter<"ScanLog"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"ScanLog"> | Date | string;
    qrCode?: Prisma.XOR<Prisma.QRCodeScalarRelationFilter, Prisma.QRCodeWhereInput>;
    batch?: Prisma.XOR<Prisma.BatchScalarRelationFilter, Prisma.BatchWhereInput>;
    user?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
};
export type ScanLogOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    qrCodeId?: Prisma.SortOrder;
    batchId?: Prisma.SortOrder;
    userId?: Prisma.SortOrderInput | Prisma.SortOrder;
    deviceId?: Prisma.SortOrderInput | Prisma.SortOrder;
    deviceModel?: Prisma.SortOrderInput | Prisma.SortOrder;
    deviceOS?: Prisma.SortOrderInput | Prisma.SortOrder;
    appVersion?: Prisma.SortOrderInput | Prisma.SortOrder;
    locationLat?: Prisma.SortOrderInput | Prisma.SortOrder;
    locationLng?: Prisma.SortOrderInput | Prisma.SortOrder;
    locationAddress?: Prisma.SortOrderInput | Prisma.SortOrder;
    scanType?: Prisma.SortOrder;
    blockchainVerified?: Prisma.SortOrder;
    blockchainStatus?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    qrCode?: Prisma.QRCodeOrderByWithRelationInput;
    batch?: Prisma.BatchOrderByWithRelationInput;
    user?: Prisma.UserOrderByWithRelationInput;
};
export type ScanLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.ScanLogWhereInput | Prisma.ScanLogWhereInput[];
    OR?: Prisma.ScanLogWhereInput[];
    NOT?: Prisma.ScanLogWhereInput | Prisma.ScanLogWhereInput[];
    qrCodeId?: Prisma.StringFilter<"ScanLog"> | string;
    batchId?: Prisma.StringFilter<"ScanLog"> | string;
    userId?: Prisma.StringNullableFilter<"ScanLog"> | string | null;
    deviceId?: Prisma.StringNullableFilter<"ScanLog"> | string | null;
    deviceModel?: Prisma.StringNullableFilter<"ScanLog"> | string | null;
    deviceOS?: Prisma.StringNullableFilter<"ScanLog"> | string | null;
    appVersion?: Prisma.StringNullableFilter<"ScanLog"> | string | null;
    locationLat?: Prisma.DecimalNullableFilter<"ScanLog"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: Prisma.DecimalNullableFilter<"ScanLog"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: Prisma.StringNullableFilter<"ScanLog"> | string | null;
    scanType?: Prisma.EnumScanTypeFilter<"ScanLog"> | $Enums.ScanType;
    blockchainVerified?: Prisma.BoolFilter<"ScanLog"> | boolean;
    blockchainStatus?: Prisma.StringNullableFilter<"ScanLog"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"ScanLog"> | Date | string;
    qrCode?: Prisma.XOR<Prisma.QRCodeScalarRelationFilter, Prisma.QRCodeWhereInput>;
    batch?: Prisma.XOR<Prisma.BatchScalarRelationFilter, Prisma.BatchWhereInput>;
    user?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
}, "id">;
export type ScanLogOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    qrCodeId?: Prisma.SortOrder;
    batchId?: Prisma.SortOrder;
    userId?: Prisma.SortOrderInput | Prisma.SortOrder;
    deviceId?: Prisma.SortOrderInput | Prisma.SortOrder;
    deviceModel?: Prisma.SortOrderInput | Prisma.SortOrder;
    deviceOS?: Prisma.SortOrderInput | Prisma.SortOrder;
    appVersion?: Prisma.SortOrderInput | Prisma.SortOrder;
    locationLat?: Prisma.SortOrderInput | Prisma.SortOrder;
    locationLng?: Prisma.SortOrderInput | Prisma.SortOrder;
    locationAddress?: Prisma.SortOrderInput | Prisma.SortOrder;
    scanType?: Prisma.SortOrder;
    blockchainVerified?: Prisma.SortOrder;
    blockchainStatus?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.ScanLogCountOrderByAggregateInput;
    _avg?: Prisma.ScanLogAvgOrderByAggregateInput;
    _max?: Prisma.ScanLogMaxOrderByAggregateInput;
    _min?: Prisma.ScanLogMinOrderByAggregateInput;
    _sum?: Prisma.ScanLogSumOrderByAggregateInput;
};
export type ScanLogScalarWhereWithAggregatesInput = {
    AND?: Prisma.ScanLogScalarWhereWithAggregatesInput | Prisma.ScanLogScalarWhereWithAggregatesInput[];
    OR?: Prisma.ScanLogScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ScanLogScalarWhereWithAggregatesInput | Prisma.ScanLogScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"ScanLog"> | string;
    qrCodeId?: Prisma.StringWithAggregatesFilter<"ScanLog"> | string;
    batchId?: Prisma.StringWithAggregatesFilter<"ScanLog"> | string;
    userId?: Prisma.StringNullableWithAggregatesFilter<"ScanLog"> | string | null;
    deviceId?: Prisma.StringNullableWithAggregatesFilter<"ScanLog"> | string | null;
    deviceModel?: Prisma.StringNullableWithAggregatesFilter<"ScanLog"> | string | null;
    deviceOS?: Prisma.StringNullableWithAggregatesFilter<"ScanLog"> | string | null;
    appVersion?: Prisma.StringNullableWithAggregatesFilter<"ScanLog"> | string | null;
    locationLat?: Prisma.DecimalNullableWithAggregatesFilter<"ScanLog"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: Prisma.DecimalNullableWithAggregatesFilter<"ScanLog"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: Prisma.StringNullableWithAggregatesFilter<"ScanLog"> | string | null;
    scanType?: Prisma.EnumScanTypeWithAggregatesFilter<"ScanLog"> | $Enums.ScanType;
    blockchainVerified?: Prisma.BoolWithAggregatesFilter<"ScanLog"> | boolean;
    blockchainStatus?: Prisma.StringNullableWithAggregatesFilter<"ScanLog"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"ScanLog"> | Date | string;
};
export type ScanLogCreateInput = {
    id?: string;
    deviceId?: string | null;
    deviceModel?: string | null;
    deviceOS?: string | null;
    appVersion?: string | null;
    locationLat?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: string | null;
    scanType?: $Enums.ScanType;
    blockchainVerified?: boolean;
    blockchainStatus?: string | null;
    createdAt?: Date | string;
    qrCode: Prisma.QRCodeCreateNestedOneWithoutScanLogsInput;
    batch: Prisma.BatchCreateNestedOneWithoutScanLogsInput;
    user?: Prisma.UserCreateNestedOneWithoutScanLogsInput;
};
export type ScanLogUncheckedCreateInput = {
    id?: string;
    qrCodeId: string;
    batchId: string;
    userId?: string | null;
    deviceId?: string | null;
    deviceModel?: string | null;
    deviceOS?: string | null;
    appVersion?: string | null;
    locationLat?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: string | null;
    scanType?: $Enums.ScanType;
    blockchainVerified?: boolean;
    blockchainStatus?: string | null;
    createdAt?: Date | string;
};
export type ScanLogUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    deviceId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceModel?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceOS?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    appVersion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    locationLat?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    scanType?: Prisma.EnumScanTypeFieldUpdateOperationsInput | $Enums.ScanType;
    blockchainVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    blockchainStatus?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    qrCode?: Prisma.QRCodeUpdateOneRequiredWithoutScanLogsNestedInput;
    batch?: Prisma.BatchUpdateOneRequiredWithoutScanLogsNestedInput;
    user?: Prisma.UserUpdateOneWithoutScanLogsNestedInput;
};
export type ScanLogUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    qrCodeId?: Prisma.StringFieldUpdateOperationsInput | string;
    batchId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceModel?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceOS?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    appVersion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    locationLat?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    scanType?: Prisma.EnumScanTypeFieldUpdateOperationsInput | $Enums.ScanType;
    blockchainVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    blockchainStatus?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ScanLogCreateManyInput = {
    id?: string;
    qrCodeId: string;
    batchId: string;
    userId?: string | null;
    deviceId?: string | null;
    deviceModel?: string | null;
    deviceOS?: string | null;
    appVersion?: string | null;
    locationLat?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: string | null;
    scanType?: $Enums.ScanType;
    blockchainVerified?: boolean;
    blockchainStatus?: string | null;
    createdAt?: Date | string;
};
export type ScanLogUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    deviceId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceModel?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceOS?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    appVersion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    locationLat?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    scanType?: Prisma.EnumScanTypeFieldUpdateOperationsInput | $Enums.ScanType;
    blockchainVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    blockchainStatus?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ScanLogUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    qrCodeId?: Prisma.StringFieldUpdateOperationsInput | string;
    batchId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceModel?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceOS?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    appVersion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    locationLat?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    scanType?: Prisma.EnumScanTypeFieldUpdateOperationsInput | $Enums.ScanType;
    blockchainVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    blockchainStatus?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ScanLogListRelationFilter = {
    every?: Prisma.ScanLogWhereInput;
    some?: Prisma.ScanLogWhereInput;
    none?: Prisma.ScanLogWhereInput;
};
export type ScanLogOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ScanLogCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    qrCodeId?: Prisma.SortOrder;
    batchId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    deviceId?: Prisma.SortOrder;
    deviceModel?: Prisma.SortOrder;
    deviceOS?: Prisma.SortOrder;
    appVersion?: Prisma.SortOrder;
    locationLat?: Prisma.SortOrder;
    locationLng?: Prisma.SortOrder;
    locationAddress?: Prisma.SortOrder;
    scanType?: Prisma.SortOrder;
    blockchainVerified?: Prisma.SortOrder;
    blockchainStatus?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type ScanLogAvgOrderByAggregateInput = {
    locationLat?: Prisma.SortOrder;
    locationLng?: Prisma.SortOrder;
};
export type ScanLogMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    qrCodeId?: Prisma.SortOrder;
    batchId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    deviceId?: Prisma.SortOrder;
    deviceModel?: Prisma.SortOrder;
    deviceOS?: Prisma.SortOrder;
    appVersion?: Prisma.SortOrder;
    locationLat?: Prisma.SortOrder;
    locationLng?: Prisma.SortOrder;
    locationAddress?: Prisma.SortOrder;
    scanType?: Prisma.SortOrder;
    blockchainVerified?: Prisma.SortOrder;
    blockchainStatus?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type ScanLogMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    qrCodeId?: Prisma.SortOrder;
    batchId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    deviceId?: Prisma.SortOrder;
    deviceModel?: Prisma.SortOrder;
    deviceOS?: Prisma.SortOrder;
    appVersion?: Prisma.SortOrder;
    locationLat?: Prisma.SortOrder;
    locationLng?: Prisma.SortOrder;
    locationAddress?: Prisma.SortOrder;
    scanType?: Prisma.SortOrder;
    blockchainVerified?: Prisma.SortOrder;
    blockchainStatus?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type ScanLogSumOrderByAggregateInput = {
    locationLat?: Prisma.SortOrder;
    locationLng?: Prisma.SortOrder;
};
export type ScanLogCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.ScanLogCreateWithoutUserInput, Prisma.ScanLogUncheckedCreateWithoutUserInput> | Prisma.ScanLogCreateWithoutUserInput[] | Prisma.ScanLogUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ScanLogCreateOrConnectWithoutUserInput | Prisma.ScanLogCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.ScanLogCreateManyUserInputEnvelope;
    connect?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
};
export type ScanLogUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.ScanLogCreateWithoutUserInput, Prisma.ScanLogUncheckedCreateWithoutUserInput> | Prisma.ScanLogCreateWithoutUserInput[] | Prisma.ScanLogUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ScanLogCreateOrConnectWithoutUserInput | Prisma.ScanLogCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.ScanLogCreateManyUserInputEnvelope;
    connect?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
};
export type ScanLogUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.ScanLogCreateWithoutUserInput, Prisma.ScanLogUncheckedCreateWithoutUserInput> | Prisma.ScanLogCreateWithoutUserInput[] | Prisma.ScanLogUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ScanLogCreateOrConnectWithoutUserInput | Prisma.ScanLogCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.ScanLogUpsertWithWhereUniqueWithoutUserInput | Prisma.ScanLogUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.ScanLogCreateManyUserInputEnvelope;
    set?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
    disconnect?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
    delete?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
    connect?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
    update?: Prisma.ScanLogUpdateWithWhereUniqueWithoutUserInput | Prisma.ScanLogUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.ScanLogUpdateManyWithWhereWithoutUserInput | Prisma.ScanLogUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.ScanLogScalarWhereInput | Prisma.ScanLogScalarWhereInput[];
};
export type ScanLogUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.ScanLogCreateWithoutUserInput, Prisma.ScanLogUncheckedCreateWithoutUserInput> | Prisma.ScanLogCreateWithoutUserInput[] | Prisma.ScanLogUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ScanLogCreateOrConnectWithoutUserInput | Prisma.ScanLogCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.ScanLogUpsertWithWhereUniqueWithoutUserInput | Prisma.ScanLogUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.ScanLogCreateManyUserInputEnvelope;
    set?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
    disconnect?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
    delete?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
    connect?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
    update?: Prisma.ScanLogUpdateWithWhereUniqueWithoutUserInput | Prisma.ScanLogUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.ScanLogUpdateManyWithWhereWithoutUserInput | Prisma.ScanLogUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.ScanLogScalarWhereInput | Prisma.ScanLogScalarWhereInput[];
};
export type ScanLogCreateNestedManyWithoutBatchInput = {
    create?: Prisma.XOR<Prisma.ScanLogCreateWithoutBatchInput, Prisma.ScanLogUncheckedCreateWithoutBatchInput> | Prisma.ScanLogCreateWithoutBatchInput[] | Prisma.ScanLogUncheckedCreateWithoutBatchInput[];
    connectOrCreate?: Prisma.ScanLogCreateOrConnectWithoutBatchInput | Prisma.ScanLogCreateOrConnectWithoutBatchInput[];
    createMany?: Prisma.ScanLogCreateManyBatchInputEnvelope;
    connect?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
};
export type ScanLogUncheckedCreateNestedManyWithoutBatchInput = {
    create?: Prisma.XOR<Prisma.ScanLogCreateWithoutBatchInput, Prisma.ScanLogUncheckedCreateWithoutBatchInput> | Prisma.ScanLogCreateWithoutBatchInput[] | Prisma.ScanLogUncheckedCreateWithoutBatchInput[];
    connectOrCreate?: Prisma.ScanLogCreateOrConnectWithoutBatchInput | Prisma.ScanLogCreateOrConnectWithoutBatchInput[];
    createMany?: Prisma.ScanLogCreateManyBatchInputEnvelope;
    connect?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
};
export type ScanLogUpdateManyWithoutBatchNestedInput = {
    create?: Prisma.XOR<Prisma.ScanLogCreateWithoutBatchInput, Prisma.ScanLogUncheckedCreateWithoutBatchInput> | Prisma.ScanLogCreateWithoutBatchInput[] | Prisma.ScanLogUncheckedCreateWithoutBatchInput[];
    connectOrCreate?: Prisma.ScanLogCreateOrConnectWithoutBatchInput | Prisma.ScanLogCreateOrConnectWithoutBatchInput[];
    upsert?: Prisma.ScanLogUpsertWithWhereUniqueWithoutBatchInput | Prisma.ScanLogUpsertWithWhereUniqueWithoutBatchInput[];
    createMany?: Prisma.ScanLogCreateManyBatchInputEnvelope;
    set?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
    disconnect?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
    delete?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
    connect?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
    update?: Prisma.ScanLogUpdateWithWhereUniqueWithoutBatchInput | Prisma.ScanLogUpdateWithWhereUniqueWithoutBatchInput[];
    updateMany?: Prisma.ScanLogUpdateManyWithWhereWithoutBatchInput | Prisma.ScanLogUpdateManyWithWhereWithoutBatchInput[];
    deleteMany?: Prisma.ScanLogScalarWhereInput | Prisma.ScanLogScalarWhereInput[];
};
export type ScanLogUncheckedUpdateManyWithoutBatchNestedInput = {
    create?: Prisma.XOR<Prisma.ScanLogCreateWithoutBatchInput, Prisma.ScanLogUncheckedCreateWithoutBatchInput> | Prisma.ScanLogCreateWithoutBatchInput[] | Prisma.ScanLogUncheckedCreateWithoutBatchInput[];
    connectOrCreate?: Prisma.ScanLogCreateOrConnectWithoutBatchInput | Prisma.ScanLogCreateOrConnectWithoutBatchInput[];
    upsert?: Prisma.ScanLogUpsertWithWhereUniqueWithoutBatchInput | Prisma.ScanLogUpsertWithWhereUniqueWithoutBatchInput[];
    createMany?: Prisma.ScanLogCreateManyBatchInputEnvelope;
    set?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
    disconnect?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
    delete?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
    connect?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
    update?: Prisma.ScanLogUpdateWithWhereUniqueWithoutBatchInput | Prisma.ScanLogUpdateWithWhereUniqueWithoutBatchInput[];
    updateMany?: Prisma.ScanLogUpdateManyWithWhereWithoutBatchInput | Prisma.ScanLogUpdateManyWithWhereWithoutBatchInput[];
    deleteMany?: Prisma.ScanLogScalarWhereInput | Prisma.ScanLogScalarWhereInput[];
};
export type ScanLogCreateNestedManyWithoutQrCodeInput = {
    create?: Prisma.XOR<Prisma.ScanLogCreateWithoutQrCodeInput, Prisma.ScanLogUncheckedCreateWithoutQrCodeInput> | Prisma.ScanLogCreateWithoutQrCodeInput[] | Prisma.ScanLogUncheckedCreateWithoutQrCodeInput[];
    connectOrCreate?: Prisma.ScanLogCreateOrConnectWithoutQrCodeInput | Prisma.ScanLogCreateOrConnectWithoutQrCodeInput[];
    createMany?: Prisma.ScanLogCreateManyQrCodeInputEnvelope;
    connect?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
};
export type ScanLogUncheckedCreateNestedManyWithoutQrCodeInput = {
    create?: Prisma.XOR<Prisma.ScanLogCreateWithoutQrCodeInput, Prisma.ScanLogUncheckedCreateWithoutQrCodeInput> | Prisma.ScanLogCreateWithoutQrCodeInput[] | Prisma.ScanLogUncheckedCreateWithoutQrCodeInput[];
    connectOrCreate?: Prisma.ScanLogCreateOrConnectWithoutQrCodeInput | Prisma.ScanLogCreateOrConnectWithoutQrCodeInput[];
    createMany?: Prisma.ScanLogCreateManyQrCodeInputEnvelope;
    connect?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
};
export type ScanLogUpdateManyWithoutQrCodeNestedInput = {
    create?: Prisma.XOR<Prisma.ScanLogCreateWithoutQrCodeInput, Prisma.ScanLogUncheckedCreateWithoutQrCodeInput> | Prisma.ScanLogCreateWithoutQrCodeInput[] | Prisma.ScanLogUncheckedCreateWithoutQrCodeInput[];
    connectOrCreate?: Prisma.ScanLogCreateOrConnectWithoutQrCodeInput | Prisma.ScanLogCreateOrConnectWithoutQrCodeInput[];
    upsert?: Prisma.ScanLogUpsertWithWhereUniqueWithoutQrCodeInput | Prisma.ScanLogUpsertWithWhereUniqueWithoutQrCodeInput[];
    createMany?: Prisma.ScanLogCreateManyQrCodeInputEnvelope;
    set?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
    disconnect?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
    delete?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
    connect?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
    update?: Prisma.ScanLogUpdateWithWhereUniqueWithoutQrCodeInput | Prisma.ScanLogUpdateWithWhereUniqueWithoutQrCodeInput[];
    updateMany?: Prisma.ScanLogUpdateManyWithWhereWithoutQrCodeInput | Prisma.ScanLogUpdateManyWithWhereWithoutQrCodeInput[];
    deleteMany?: Prisma.ScanLogScalarWhereInput | Prisma.ScanLogScalarWhereInput[];
};
export type ScanLogUncheckedUpdateManyWithoutQrCodeNestedInput = {
    create?: Prisma.XOR<Prisma.ScanLogCreateWithoutQrCodeInput, Prisma.ScanLogUncheckedCreateWithoutQrCodeInput> | Prisma.ScanLogCreateWithoutQrCodeInput[] | Prisma.ScanLogUncheckedCreateWithoutQrCodeInput[];
    connectOrCreate?: Prisma.ScanLogCreateOrConnectWithoutQrCodeInput | Prisma.ScanLogCreateOrConnectWithoutQrCodeInput[];
    upsert?: Prisma.ScanLogUpsertWithWhereUniqueWithoutQrCodeInput | Prisma.ScanLogUpsertWithWhereUniqueWithoutQrCodeInput[];
    createMany?: Prisma.ScanLogCreateManyQrCodeInputEnvelope;
    set?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
    disconnect?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
    delete?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
    connect?: Prisma.ScanLogWhereUniqueInput | Prisma.ScanLogWhereUniqueInput[];
    update?: Prisma.ScanLogUpdateWithWhereUniqueWithoutQrCodeInput | Prisma.ScanLogUpdateWithWhereUniqueWithoutQrCodeInput[];
    updateMany?: Prisma.ScanLogUpdateManyWithWhereWithoutQrCodeInput | Prisma.ScanLogUpdateManyWithWhereWithoutQrCodeInput[];
    deleteMany?: Prisma.ScanLogScalarWhereInput | Prisma.ScanLogScalarWhereInput[];
};
export type NullableDecimalFieldUpdateOperationsInput = {
    set?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    increment?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    decrement?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    multiply?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    divide?: runtime.Decimal | runtime.DecimalJsLike | number | string;
};
export type EnumScanTypeFieldUpdateOperationsInput = {
    set?: $Enums.ScanType;
};
export type ScanLogCreateWithoutUserInput = {
    id?: string;
    deviceId?: string | null;
    deviceModel?: string | null;
    deviceOS?: string | null;
    appVersion?: string | null;
    locationLat?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: string | null;
    scanType?: $Enums.ScanType;
    blockchainVerified?: boolean;
    blockchainStatus?: string | null;
    createdAt?: Date | string;
    qrCode: Prisma.QRCodeCreateNestedOneWithoutScanLogsInput;
    batch: Prisma.BatchCreateNestedOneWithoutScanLogsInput;
};
export type ScanLogUncheckedCreateWithoutUserInput = {
    id?: string;
    qrCodeId: string;
    batchId: string;
    deviceId?: string | null;
    deviceModel?: string | null;
    deviceOS?: string | null;
    appVersion?: string | null;
    locationLat?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: string | null;
    scanType?: $Enums.ScanType;
    blockchainVerified?: boolean;
    blockchainStatus?: string | null;
    createdAt?: Date | string;
};
export type ScanLogCreateOrConnectWithoutUserInput = {
    where: Prisma.ScanLogWhereUniqueInput;
    create: Prisma.XOR<Prisma.ScanLogCreateWithoutUserInput, Prisma.ScanLogUncheckedCreateWithoutUserInput>;
};
export type ScanLogCreateManyUserInputEnvelope = {
    data: Prisma.ScanLogCreateManyUserInput | Prisma.ScanLogCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type ScanLogUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.ScanLogWhereUniqueInput;
    update: Prisma.XOR<Prisma.ScanLogUpdateWithoutUserInput, Prisma.ScanLogUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.ScanLogCreateWithoutUserInput, Prisma.ScanLogUncheckedCreateWithoutUserInput>;
};
export type ScanLogUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.ScanLogWhereUniqueInput;
    data: Prisma.XOR<Prisma.ScanLogUpdateWithoutUserInput, Prisma.ScanLogUncheckedUpdateWithoutUserInput>;
};
export type ScanLogUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.ScanLogScalarWhereInput;
    data: Prisma.XOR<Prisma.ScanLogUpdateManyMutationInput, Prisma.ScanLogUncheckedUpdateManyWithoutUserInput>;
};
export type ScanLogScalarWhereInput = {
    AND?: Prisma.ScanLogScalarWhereInput | Prisma.ScanLogScalarWhereInput[];
    OR?: Prisma.ScanLogScalarWhereInput[];
    NOT?: Prisma.ScanLogScalarWhereInput | Prisma.ScanLogScalarWhereInput[];
    id?: Prisma.StringFilter<"ScanLog"> | string;
    qrCodeId?: Prisma.StringFilter<"ScanLog"> | string;
    batchId?: Prisma.StringFilter<"ScanLog"> | string;
    userId?: Prisma.StringNullableFilter<"ScanLog"> | string | null;
    deviceId?: Prisma.StringNullableFilter<"ScanLog"> | string | null;
    deviceModel?: Prisma.StringNullableFilter<"ScanLog"> | string | null;
    deviceOS?: Prisma.StringNullableFilter<"ScanLog"> | string | null;
    appVersion?: Prisma.StringNullableFilter<"ScanLog"> | string | null;
    locationLat?: Prisma.DecimalNullableFilter<"ScanLog"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: Prisma.DecimalNullableFilter<"ScanLog"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: Prisma.StringNullableFilter<"ScanLog"> | string | null;
    scanType?: Prisma.EnumScanTypeFilter<"ScanLog"> | $Enums.ScanType;
    blockchainVerified?: Prisma.BoolFilter<"ScanLog"> | boolean;
    blockchainStatus?: Prisma.StringNullableFilter<"ScanLog"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"ScanLog"> | Date | string;
};
export type ScanLogCreateWithoutBatchInput = {
    id?: string;
    deviceId?: string | null;
    deviceModel?: string | null;
    deviceOS?: string | null;
    appVersion?: string | null;
    locationLat?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: string | null;
    scanType?: $Enums.ScanType;
    blockchainVerified?: boolean;
    blockchainStatus?: string | null;
    createdAt?: Date | string;
    qrCode: Prisma.QRCodeCreateNestedOneWithoutScanLogsInput;
    user?: Prisma.UserCreateNestedOneWithoutScanLogsInput;
};
export type ScanLogUncheckedCreateWithoutBatchInput = {
    id?: string;
    qrCodeId: string;
    userId?: string | null;
    deviceId?: string | null;
    deviceModel?: string | null;
    deviceOS?: string | null;
    appVersion?: string | null;
    locationLat?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: string | null;
    scanType?: $Enums.ScanType;
    blockchainVerified?: boolean;
    blockchainStatus?: string | null;
    createdAt?: Date | string;
};
export type ScanLogCreateOrConnectWithoutBatchInput = {
    where: Prisma.ScanLogWhereUniqueInput;
    create: Prisma.XOR<Prisma.ScanLogCreateWithoutBatchInput, Prisma.ScanLogUncheckedCreateWithoutBatchInput>;
};
export type ScanLogCreateManyBatchInputEnvelope = {
    data: Prisma.ScanLogCreateManyBatchInput | Prisma.ScanLogCreateManyBatchInput[];
    skipDuplicates?: boolean;
};
export type ScanLogUpsertWithWhereUniqueWithoutBatchInput = {
    where: Prisma.ScanLogWhereUniqueInput;
    update: Prisma.XOR<Prisma.ScanLogUpdateWithoutBatchInput, Prisma.ScanLogUncheckedUpdateWithoutBatchInput>;
    create: Prisma.XOR<Prisma.ScanLogCreateWithoutBatchInput, Prisma.ScanLogUncheckedCreateWithoutBatchInput>;
};
export type ScanLogUpdateWithWhereUniqueWithoutBatchInput = {
    where: Prisma.ScanLogWhereUniqueInput;
    data: Prisma.XOR<Prisma.ScanLogUpdateWithoutBatchInput, Prisma.ScanLogUncheckedUpdateWithoutBatchInput>;
};
export type ScanLogUpdateManyWithWhereWithoutBatchInput = {
    where: Prisma.ScanLogScalarWhereInput;
    data: Prisma.XOR<Prisma.ScanLogUpdateManyMutationInput, Prisma.ScanLogUncheckedUpdateManyWithoutBatchInput>;
};
export type ScanLogCreateWithoutQrCodeInput = {
    id?: string;
    deviceId?: string | null;
    deviceModel?: string | null;
    deviceOS?: string | null;
    appVersion?: string | null;
    locationLat?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: string | null;
    scanType?: $Enums.ScanType;
    blockchainVerified?: boolean;
    blockchainStatus?: string | null;
    createdAt?: Date | string;
    batch: Prisma.BatchCreateNestedOneWithoutScanLogsInput;
    user?: Prisma.UserCreateNestedOneWithoutScanLogsInput;
};
export type ScanLogUncheckedCreateWithoutQrCodeInput = {
    id?: string;
    batchId: string;
    userId?: string | null;
    deviceId?: string | null;
    deviceModel?: string | null;
    deviceOS?: string | null;
    appVersion?: string | null;
    locationLat?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: string | null;
    scanType?: $Enums.ScanType;
    blockchainVerified?: boolean;
    blockchainStatus?: string | null;
    createdAt?: Date | string;
};
export type ScanLogCreateOrConnectWithoutQrCodeInput = {
    where: Prisma.ScanLogWhereUniqueInput;
    create: Prisma.XOR<Prisma.ScanLogCreateWithoutQrCodeInput, Prisma.ScanLogUncheckedCreateWithoutQrCodeInput>;
};
export type ScanLogCreateManyQrCodeInputEnvelope = {
    data: Prisma.ScanLogCreateManyQrCodeInput | Prisma.ScanLogCreateManyQrCodeInput[];
    skipDuplicates?: boolean;
};
export type ScanLogUpsertWithWhereUniqueWithoutQrCodeInput = {
    where: Prisma.ScanLogWhereUniqueInput;
    update: Prisma.XOR<Prisma.ScanLogUpdateWithoutQrCodeInput, Prisma.ScanLogUncheckedUpdateWithoutQrCodeInput>;
    create: Prisma.XOR<Prisma.ScanLogCreateWithoutQrCodeInput, Prisma.ScanLogUncheckedCreateWithoutQrCodeInput>;
};
export type ScanLogUpdateWithWhereUniqueWithoutQrCodeInput = {
    where: Prisma.ScanLogWhereUniqueInput;
    data: Prisma.XOR<Prisma.ScanLogUpdateWithoutQrCodeInput, Prisma.ScanLogUncheckedUpdateWithoutQrCodeInput>;
};
export type ScanLogUpdateManyWithWhereWithoutQrCodeInput = {
    where: Prisma.ScanLogScalarWhereInput;
    data: Prisma.XOR<Prisma.ScanLogUpdateManyMutationInput, Prisma.ScanLogUncheckedUpdateManyWithoutQrCodeInput>;
};
export type ScanLogCreateManyUserInput = {
    id?: string;
    qrCodeId: string;
    batchId: string;
    deviceId?: string | null;
    deviceModel?: string | null;
    deviceOS?: string | null;
    appVersion?: string | null;
    locationLat?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: string | null;
    scanType?: $Enums.ScanType;
    blockchainVerified?: boolean;
    blockchainStatus?: string | null;
    createdAt?: Date | string;
};
export type ScanLogUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    deviceId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceModel?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceOS?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    appVersion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    locationLat?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    scanType?: Prisma.EnumScanTypeFieldUpdateOperationsInput | $Enums.ScanType;
    blockchainVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    blockchainStatus?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    qrCode?: Prisma.QRCodeUpdateOneRequiredWithoutScanLogsNestedInput;
    batch?: Prisma.BatchUpdateOneRequiredWithoutScanLogsNestedInput;
};
export type ScanLogUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    qrCodeId?: Prisma.StringFieldUpdateOperationsInput | string;
    batchId?: Prisma.StringFieldUpdateOperationsInput | string;
    deviceId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceModel?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceOS?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    appVersion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    locationLat?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    scanType?: Prisma.EnumScanTypeFieldUpdateOperationsInput | $Enums.ScanType;
    blockchainVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    blockchainStatus?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ScanLogUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    qrCodeId?: Prisma.StringFieldUpdateOperationsInput | string;
    batchId?: Prisma.StringFieldUpdateOperationsInput | string;
    deviceId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceModel?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceOS?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    appVersion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    locationLat?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    scanType?: Prisma.EnumScanTypeFieldUpdateOperationsInput | $Enums.ScanType;
    blockchainVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    blockchainStatus?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ScanLogCreateManyBatchInput = {
    id?: string;
    qrCodeId: string;
    userId?: string | null;
    deviceId?: string | null;
    deviceModel?: string | null;
    deviceOS?: string | null;
    appVersion?: string | null;
    locationLat?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: string | null;
    scanType?: $Enums.ScanType;
    blockchainVerified?: boolean;
    blockchainStatus?: string | null;
    createdAt?: Date | string;
};
export type ScanLogUpdateWithoutBatchInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    deviceId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceModel?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceOS?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    appVersion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    locationLat?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    scanType?: Prisma.EnumScanTypeFieldUpdateOperationsInput | $Enums.ScanType;
    blockchainVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    blockchainStatus?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    qrCode?: Prisma.QRCodeUpdateOneRequiredWithoutScanLogsNestedInput;
    user?: Prisma.UserUpdateOneWithoutScanLogsNestedInput;
};
export type ScanLogUncheckedUpdateWithoutBatchInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    qrCodeId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceModel?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceOS?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    appVersion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    locationLat?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    scanType?: Prisma.EnumScanTypeFieldUpdateOperationsInput | $Enums.ScanType;
    blockchainVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    blockchainStatus?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ScanLogUncheckedUpdateManyWithoutBatchInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    qrCodeId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceModel?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceOS?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    appVersion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    locationLat?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    scanType?: Prisma.EnumScanTypeFieldUpdateOperationsInput | $Enums.ScanType;
    blockchainVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    blockchainStatus?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ScanLogCreateManyQrCodeInput = {
    id?: string;
    batchId: string;
    userId?: string | null;
    deviceId?: string | null;
    deviceModel?: string | null;
    deviceOS?: string | null;
    appVersion?: string | null;
    locationLat?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: string | null;
    scanType?: $Enums.ScanType;
    blockchainVerified?: boolean;
    blockchainStatus?: string | null;
    createdAt?: Date | string;
};
export type ScanLogUpdateWithoutQrCodeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    deviceId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceModel?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceOS?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    appVersion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    locationLat?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    scanType?: Prisma.EnumScanTypeFieldUpdateOperationsInput | $Enums.ScanType;
    blockchainVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    blockchainStatus?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    batch?: Prisma.BatchUpdateOneRequiredWithoutScanLogsNestedInput;
    user?: Prisma.UserUpdateOneWithoutScanLogsNestedInput;
};
export type ScanLogUncheckedUpdateWithoutQrCodeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    batchId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceModel?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceOS?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    appVersion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    locationLat?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    scanType?: Prisma.EnumScanTypeFieldUpdateOperationsInput | $Enums.ScanType;
    blockchainVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    blockchainStatus?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ScanLogUncheckedUpdateManyWithoutQrCodeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    batchId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceModel?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    deviceOS?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    appVersion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    locationLat?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationLng?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    locationAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    scanType?: Prisma.EnumScanTypeFieldUpdateOperationsInput | $Enums.ScanType;
    blockchainVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    blockchainStatus?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ScanLogSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    qrCodeId?: boolean;
    batchId?: boolean;
    userId?: boolean;
    deviceId?: boolean;
    deviceModel?: boolean;
    deviceOS?: boolean;
    appVersion?: boolean;
    locationLat?: boolean;
    locationLng?: boolean;
    locationAddress?: boolean;
    scanType?: boolean;
    blockchainVerified?: boolean;
    blockchainStatus?: boolean;
    createdAt?: boolean;
    qrCode?: boolean | Prisma.QRCodeDefaultArgs<ExtArgs>;
    batch?: boolean | Prisma.BatchDefaultArgs<ExtArgs>;
    user?: boolean | Prisma.ScanLog$userArgs<ExtArgs>;
}, ExtArgs["result"]["scanLog"]>;
export type ScanLogSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    qrCodeId?: boolean;
    batchId?: boolean;
    userId?: boolean;
    deviceId?: boolean;
    deviceModel?: boolean;
    deviceOS?: boolean;
    appVersion?: boolean;
    locationLat?: boolean;
    locationLng?: boolean;
    locationAddress?: boolean;
    scanType?: boolean;
    blockchainVerified?: boolean;
    blockchainStatus?: boolean;
    createdAt?: boolean;
    qrCode?: boolean | Prisma.QRCodeDefaultArgs<ExtArgs>;
    batch?: boolean | Prisma.BatchDefaultArgs<ExtArgs>;
    user?: boolean | Prisma.ScanLog$userArgs<ExtArgs>;
}, ExtArgs["result"]["scanLog"]>;
export type ScanLogSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    qrCodeId?: boolean;
    batchId?: boolean;
    userId?: boolean;
    deviceId?: boolean;
    deviceModel?: boolean;
    deviceOS?: boolean;
    appVersion?: boolean;
    locationLat?: boolean;
    locationLng?: boolean;
    locationAddress?: boolean;
    scanType?: boolean;
    blockchainVerified?: boolean;
    blockchainStatus?: boolean;
    createdAt?: boolean;
    qrCode?: boolean | Prisma.QRCodeDefaultArgs<ExtArgs>;
    batch?: boolean | Prisma.BatchDefaultArgs<ExtArgs>;
    user?: boolean | Prisma.ScanLog$userArgs<ExtArgs>;
}, ExtArgs["result"]["scanLog"]>;
export type ScanLogSelectScalar = {
    id?: boolean;
    qrCodeId?: boolean;
    batchId?: boolean;
    userId?: boolean;
    deviceId?: boolean;
    deviceModel?: boolean;
    deviceOS?: boolean;
    appVersion?: boolean;
    locationLat?: boolean;
    locationLng?: boolean;
    locationAddress?: boolean;
    scanType?: boolean;
    blockchainVerified?: boolean;
    blockchainStatus?: boolean;
    createdAt?: boolean;
};
export type ScanLogOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "qrCodeId" | "batchId" | "userId" | "deviceId" | "deviceModel" | "deviceOS" | "appVersion" | "locationLat" | "locationLng" | "locationAddress" | "scanType" | "blockchainVerified" | "blockchainStatus" | "createdAt", ExtArgs["result"]["scanLog"]>;
export type ScanLogInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    qrCode?: boolean | Prisma.QRCodeDefaultArgs<ExtArgs>;
    batch?: boolean | Prisma.BatchDefaultArgs<ExtArgs>;
    user?: boolean | Prisma.ScanLog$userArgs<ExtArgs>;
};
export type ScanLogIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    qrCode?: boolean | Prisma.QRCodeDefaultArgs<ExtArgs>;
    batch?: boolean | Prisma.BatchDefaultArgs<ExtArgs>;
    user?: boolean | Prisma.ScanLog$userArgs<ExtArgs>;
};
export type ScanLogIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    qrCode?: boolean | Prisma.QRCodeDefaultArgs<ExtArgs>;
    batch?: boolean | Prisma.BatchDefaultArgs<ExtArgs>;
    user?: boolean | Prisma.ScanLog$userArgs<ExtArgs>;
};
export type $ScanLogPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ScanLog";
    objects: {
        qrCode: Prisma.$QRCodePayload<ExtArgs>;
        batch: Prisma.$BatchPayload<ExtArgs>;
        user: Prisma.$UserPayload<ExtArgs> | null;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        qrCodeId: string;
        batchId: string;
        userId: string | null;
        deviceId: string | null;
        deviceModel: string | null;
        deviceOS: string | null;
        appVersion: string | null;
        locationLat: runtime.Decimal | null;
        locationLng: runtime.Decimal | null;
        locationAddress: string | null;
        scanType: $Enums.ScanType;
        blockchainVerified: boolean;
        blockchainStatus: string | null;
        createdAt: Date;
    }, ExtArgs["result"]["scanLog"]>;
    composites: {};
};
export type ScanLogGetPayload<S extends boolean | null | undefined | ScanLogDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ScanLogPayload, S>;
export type ScanLogCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ScanLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ScanLogCountAggregateInputType | true;
};
export interface ScanLogDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ScanLog'];
        meta: {
            name: 'ScanLog';
        };
    };
    /**
     * Find zero or one ScanLog that matches the filter.
     * @param {ScanLogFindUniqueArgs} args - Arguments to find a ScanLog
     * @example
     * // Get one ScanLog
     * const scanLog = await prisma.scanLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ScanLogFindUniqueArgs>(args: Prisma.SelectSubset<T, ScanLogFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ScanLogClient<runtime.Types.Result.GetResult<Prisma.$ScanLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one ScanLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ScanLogFindUniqueOrThrowArgs} args - Arguments to find a ScanLog
     * @example
     * // Get one ScanLog
     * const scanLog = await prisma.scanLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ScanLogFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ScanLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ScanLogClient<runtime.Types.Result.GetResult<Prisma.$ScanLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ScanLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanLogFindFirstArgs} args - Arguments to find a ScanLog
     * @example
     * // Get one ScanLog
     * const scanLog = await prisma.scanLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ScanLogFindFirstArgs>(args?: Prisma.SelectSubset<T, ScanLogFindFirstArgs<ExtArgs>>): Prisma.Prisma__ScanLogClient<runtime.Types.Result.GetResult<Prisma.$ScanLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ScanLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanLogFindFirstOrThrowArgs} args - Arguments to find a ScanLog
     * @example
     * // Get one ScanLog
     * const scanLog = await prisma.scanLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ScanLogFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ScanLogFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ScanLogClient<runtime.Types.Result.GetResult<Prisma.$ScanLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more ScanLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ScanLogs
     * const scanLogs = await prisma.scanLog.findMany()
     *
     * // Get first 10 ScanLogs
     * const scanLogs = await prisma.scanLog.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const scanLogWithIdOnly = await prisma.scanLog.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ScanLogFindManyArgs>(args?: Prisma.SelectSubset<T, ScanLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ScanLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a ScanLog.
     * @param {ScanLogCreateArgs} args - Arguments to create a ScanLog.
     * @example
     * // Create one ScanLog
     * const ScanLog = await prisma.scanLog.create({
     *   data: {
     *     // ... data to create a ScanLog
     *   }
     * })
     *
     */
    create<T extends ScanLogCreateArgs>(args: Prisma.SelectSubset<T, ScanLogCreateArgs<ExtArgs>>): Prisma.Prisma__ScanLogClient<runtime.Types.Result.GetResult<Prisma.$ScanLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many ScanLogs.
     * @param {ScanLogCreateManyArgs} args - Arguments to create many ScanLogs.
     * @example
     * // Create many ScanLogs
     * const scanLog = await prisma.scanLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ScanLogCreateManyArgs>(args?: Prisma.SelectSubset<T, ScanLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many ScanLogs and returns the data saved in the database.
     * @param {ScanLogCreateManyAndReturnArgs} args - Arguments to create many ScanLogs.
     * @example
     * // Create many ScanLogs
     * const scanLog = await prisma.scanLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many ScanLogs and only return the `id`
     * const scanLogWithIdOnly = await prisma.scanLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ScanLogCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ScanLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ScanLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a ScanLog.
     * @param {ScanLogDeleteArgs} args - Arguments to delete one ScanLog.
     * @example
     * // Delete one ScanLog
     * const ScanLog = await prisma.scanLog.delete({
     *   where: {
     *     // ... filter to delete one ScanLog
     *   }
     * })
     *
     */
    delete<T extends ScanLogDeleteArgs>(args: Prisma.SelectSubset<T, ScanLogDeleteArgs<ExtArgs>>): Prisma.Prisma__ScanLogClient<runtime.Types.Result.GetResult<Prisma.$ScanLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one ScanLog.
     * @param {ScanLogUpdateArgs} args - Arguments to update one ScanLog.
     * @example
     * // Update one ScanLog
     * const scanLog = await prisma.scanLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ScanLogUpdateArgs>(args: Prisma.SelectSubset<T, ScanLogUpdateArgs<ExtArgs>>): Prisma.Prisma__ScanLogClient<runtime.Types.Result.GetResult<Prisma.$ScanLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more ScanLogs.
     * @param {ScanLogDeleteManyArgs} args - Arguments to filter ScanLogs to delete.
     * @example
     * // Delete a few ScanLogs
     * const { count } = await prisma.scanLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ScanLogDeleteManyArgs>(args?: Prisma.SelectSubset<T, ScanLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ScanLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ScanLogs
     * const scanLog = await prisma.scanLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ScanLogUpdateManyArgs>(args: Prisma.SelectSubset<T, ScanLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ScanLogs and returns the data updated in the database.
     * @param {ScanLogUpdateManyAndReturnArgs} args - Arguments to update many ScanLogs.
     * @example
     * // Update many ScanLogs
     * const scanLog = await prisma.scanLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more ScanLogs and only return the `id`
     * const scanLogWithIdOnly = await prisma.scanLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends ScanLogUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ScanLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ScanLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one ScanLog.
     * @param {ScanLogUpsertArgs} args - Arguments to update or create a ScanLog.
     * @example
     * // Update or create a ScanLog
     * const scanLog = await prisma.scanLog.upsert({
     *   create: {
     *     // ... data to create a ScanLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ScanLog we want to update
     *   }
     * })
     */
    upsert<T extends ScanLogUpsertArgs>(args: Prisma.SelectSubset<T, ScanLogUpsertArgs<ExtArgs>>): Prisma.Prisma__ScanLogClient<runtime.Types.Result.GetResult<Prisma.$ScanLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of ScanLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanLogCountArgs} args - Arguments to filter ScanLogs to count.
     * @example
     * // Count the number of ScanLogs
     * const count = await prisma.scanLog.count({
     *   where: {
     *     // ... the filter for the ScanLogs we want to count
     *   }
     * })
    **/
    count<T extends ScanLogCountArgs>(args?: Prisma.Subset<T, ScanLogCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ScanLogCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a ScanLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ScanLogAggregateArgs>(args: Prisma.Subset<T, ScanLogAggregateArgs>): Prisma.PrismaPromise<GetScanLogAggregateType<T>>;
    /**
     * Group by ScanLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<T extends ScanLogGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ScanLogGroupByArgs['orderBy'];
    } : {
        orderBy?: ScanLogGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ScanLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetScanLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the ScanLog model
     */
    readonly fields: ScanLogFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for ScanLog.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__ScanLogClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    qrCode<T extends Prisma.QRCodeDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.QRCodeDefaultArgs<ExtArgs>>): Prisma.Prisma__QRCodeClient<runtime.Types.Result.GetResult<Prisma.$QRCodePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    batch<T extends Prisma.BatchDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.BatchDefaultArgs<ExtArgs>>): Prisma.Prisma__BatchClient<runtime.Types.Result.GetResult<Prisma.$BatchPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    user<T extends Prisma.ScanLog$userArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ScanLog$userArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the ScanLog model
 */
export interface ScanLogFieldRefs {
    readonly id: Prisma.FieldRef<"ScanLog", 'String'>;
    readonly qrCodeId: Prisma.FieldRef<"ScanLog", 'String'>;
    readonly batchId: Prisma.FieldRef<"ScanLog", 'String'>;
    readonly userId: Prisma.FieldRef<"ScanLog", 'String'>;
    readonly deviceId: Prisma.FieldRef<"ScanLog", 'String'>;
    readonly deviceModel: Prisma.FieldRef<"ScanLog", 'String'>;
    readonly deviceOS: Prisma.FieldRef<"ScanLog", 'String'>;
    readonly appVersion: Prisma.FieldRef<"ScanLog", 'String'>;
    readonly locationLat: Prisma.FieldRef<"ScanLog", 'Decimal'>;
    readonly locationLng: Prisma.FieldRef<"ScanLog", 'Decimal'>;
    readonly locationAddress: Prisma.FieldRef<"ScanLog", 'String'>;
    readonly scanType: Prisma.FieldRef<"ScanLog", 'ScanType'>;
    readonly blockchainVerified: Prisma.FieldRef<"ScanLog", 'Boolean'>;
    readonly blockchainStatus: Prisma.FieldRef<"ScanLog", 'String'>;
    readonly createdAt: Prisma.FieldRef<"ScanLog", 'DateTime'>;
}
/**
 * ScanLog findUnique
 */
export type ScanLogFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanLog
     */
    select?: Prisma.ScanLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScanLog
     */
    omit?: Prisma.ScanLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScanLogInclude<ExtArgs> | null;
    /**
     * Filter, which ScanLog to fetch.
     */
    where: Prisma.ScanLogWhereUniqueInput;
};
/**
 * ScanLog findUniqueOrThrow
 */
export type ScanLogFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanLog
     */
    select?: Prisma.ScanLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScanLog
     */
    omit?: Prisma.ScanLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScanLogInclude<ExtArgs> | null;
    /**
     * Filter, which ScanLog to fetch.
     */
    where: Prisma.ScanLogWhereUniqueInput;
};
/**
 * ScanLog findFirst
 */
export type ScanLogFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanLog
     */
    select?: Prisma.ScanLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScanLog
     */
    omit?: Prisma.ScanLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScanLogInclude<ExtArgs> | null;
    /**
     * Filter, which ScanLog to fetch.
     */
    where?: Prisma.ScanLogWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ScanLogs to fetch.
     */
    orderBy?: Prisma.ScanLogOrderByWithRelationInput | Prisma.ScanLogOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ScanLogs.
     */
    cursor?: Prisma.ScanLogWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ScanLogs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ScanLogs.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ScanLogs.
     */
    distinct?: Prisma.ScanLogScalarFieldEnum | Prisma.ScanLogScalarFieldEnum[];
};
/**
 * ScanLog findFirstOrThrow
 */
export type ScanLogFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanLog
     */
    select?: Prisma.ScanLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScanLog
     */
    omit?: Prisma.ScanLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScanLogInclude<ExtArgs> | null;
    /**
     * Filter, which ScanLog to fetch.
     */
    where?: Prisma.ScanLogWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ScanLogs to fetch.
     */
    orderBy?: Prisma.ScanLogOrderByWithRelationInput | Prisma.ScanLogOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ScanLogs.
     */
    cursor?: Prisma.ScanLogWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ScanLogs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ScanLogs.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ScanLogs.
     */
    distinct?: Prisma.ScanLogScalarFieldEnum | Prisma.ScanLogScalarFieldEnum[];
};
/**
 * ScanLog findMany
 */
export type ScanLogFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanLog
     */
    select?: Prisma.ScanLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScanLog
     */
    omit?: Prisma.ScanLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScanLogInclude<ExtArgs> | null;
    /**
     * Filter, which ScanLogs to fetch.
     */
    where?: Prisma.ScanLogWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ScanLogs to fetch.
     */
    orderBy?: Prisma.ScanLogOrderByWithRelationInput | Prisma.ScanLogOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing ScanLogs.
     */
    cursor?: Prisma.ScanLogWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ScanLogs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ScanLogs.
     */
    skip?: number;
    distinct?: Prisma.ScanLogScalarFieldEnum | Prisma.ScanLogScalarFieldEnum[];
};
/**
 * ScanLog create
 */
export type ScanLogCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanLog
     */
    select?: Prisma.ScanLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScanLog
     */
    omit?: Prisma.ScanLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScanLogInclude<ExtArgs> | null;
    /**
     * The data needed to create a ScanLog.
     */
    data: Prisma.XOR<Prisma.ScanLogCreateInput, Prisma.ScanLogUncheckedCreateInput>;
};
/**
 * ScanLog createMany
 */
export type ScanLogCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many ScanLogs.
     */
    data: Prisma.ScanLogCreateManyInput | Prisma.ScanLogCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * ScanLog createManyAndReturn
 */
export type ScanLogCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanLog
     */
    select?: Prisma.ScanLogSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ScanLog
     */
    omit?: Prisma.ScanLogOmit<ExtArgs> | null;
    /**
     * The data used to create many ScanLogs.
     */
    data: Prisma.ScanLogCreateManyInput | Prisma.ScanLogCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScanLogIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * ScanLog update
 */
export type ScanLogUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanLog
     */
    select?: Prisma.ScanLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScanLog
     */
    omit?: Prisma.ScanLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScanLogInclude<ExtArgs> | null;
    /**
     * The data needed to update a ScanLog.
     */
    data: Prisma.XOR<Prisma.ScanLogUpdateInput, Prisma.ScanLogUncheckedUpdateInput>;
    /**
     * Choose, which ScanLog to update.
     */
    where: Prisma.ScanLogWhereUniqueInput;
};
/**
 * ScanLog updateMany
 */
export type ScanLogUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update ScanLogs.
     */
    data: Prisma.XOR<Prisma.ScanLogUpdateManyMutationInput, Prisma.ScanLogUncheckedUpdateManyInput>;
    /**
     * Filter which ScanLogs to update
     */
    where?: Prisma.ScanLogWhereInput;
    /**
     * Limit how many ScanLogs to update.
     */
    limit?: number;
};
/**
 * ScanLog updateManyAndReturn
 */
export type ScanLogUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanLog
     */
    select?: Prisma.ScanLogSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ScanLog
     */
    omit?: Prisma.ScanLogOmit<ExtArgs> | null;
    /**
     * The data used to update ScanLogs.
     */
    data: Prisma.XOR<Prisma.ScanLogUpdateManyMutationInput, Prisma.ScanLogUncheckedUpdateManyInput>;
    /**
     * Filter which ScanLogs to update
     */
    where?: Prisma.ScanLogWhereInput;
    /**
     * Limit how many ScanLogs to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScanLogIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * ScanLog upsert
 */
export type ScanLogUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanLog
     */
    select?: Prisma.ScanLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScanLog
     */
    omit?: Prisma.ScanLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScanLogInclude<ExtArgs> | null;
    /**
     * The filter to search for the ScanLog to update in case it exists.
     */
    where: Prisma.ScanLogWhereUniqueInput;
    /**
     * In case the ScanLog found by the `where` argument doesn't exist, create a new ScanLog with this data.
     */
    create: Prisma.XOR<Prisma.ScanLogCreateInput, Prisma.ScanLogUncheckedCreateInput>;
    /**
     * In case the ScanLog was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.ScanLogUpdateInput, Prisma.ScanLogUncheckedUpdateInput>;
};
/**
 * ScanLog delete
 */
export type ScanLogDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanLog
     */
    select?: Prisma.ScanLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScanLog
     */
    omit?: Prisma.ScanLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScanLogInclude<ExtArgs> | null;
    /**
     * Filter which ScanLog to delete.
     */
    where: Prisma.ScanLogWhereUniqueInput;
};
/**
 * ScanLog deleteMany
 */
export type ScanLogDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ScanLogs to delete
     */
    where?: Prisma.ScanLogWhereInput;
    /**
     * Limit how many ScanLogs to delete.
     */
    limit?: number;
};
/**
 * ScanLog.user
 */
export type ScanLog$userArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: Prisma.UserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the User
     */
    omit?: Prisma.UserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
};
/**
 * ScanLog without action
 */
export type ScanLogDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScanLog
     */
    select?: Prisma.ScanLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScanLog
     */
    omit?: Prisma.ScanLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScanLogInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=ScanLog.d.ts.map