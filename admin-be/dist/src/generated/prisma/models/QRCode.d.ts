/**
 * This file exports the `QRCode` model and its related types.
 *
 * 🟢 You can import this file directly.
 */
import * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model QRCode
 *
 */
export type QRCodeModel = runtime.Types.Result.DefaultSelection<Prisma.$QRCodePayload>;
export type AggregateQRCode = {
    _count: QRCodeCountAggregateOutputType | null;
    _avg: QRCodeAvgAggregateOutputType | null;
    _sum: QRCodeSumAggregateOutputType | null;
    _min: QRCodeMinAggregateOutputType | null;
    _max: QRCodeMaxAggregateOutputType | null;
};
export type QRCodeAvgAggregateOutputType = {
    unitNumber: number | null;
};
export type QRCodeSumAggregateOutputType = {
    unitNumber: number | null;
};
export type QRCodeMinAggregateOutputType = {
    id: string | null;
    code: string | null;
    batchId: string | null;
    unitNumber: number | null;
    isActive: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type QRCodeMaxAggregateOutputType = {
    id: string | null;
    code: string | null;
    batchId: string | null;
    unitNumber: number | null;
    isActive: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type QRCodeCountAggregateOutputType = {
    id: number;
    code: number;
    batchId: number;
    unitNumber: number;
    isActive: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type QRCodeAvgAggregateInputType = {
    unitNumber?: true;
};
export type QRCodeSumAggregateInputType = {
    unitNumber?: true;
};
export type QRCodeMinAggregateInputType = {
    id?: true;
    code?: true;
    batchId?: true;
    unitNumber?: true;
    isActive?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type QRCodeMaxAggregateInputType = {
    id?: true;
    code?: true;
    batchId?: true;
    unitNumber?: true;
    isActive?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type QRCodeCountAggregateInputType = {
    id?: true;
    code?: true;
    batchId?: true;
    unitNumber?: true;
    isActive?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type QRCodeAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which QRCode to aggregate.
     */
    where?: Prisma.QRCodeWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of QRCodes to fetch.
     */
    orderBy?: Prisma.QRCodeOrderByWithRelationInput | Prisma.QRCodeOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.QRCodeWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` QRCodes from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` QRCodes.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned QRCodes
    **/
    _count?: true | QRCodeCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: QRCodeAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: QRCodeSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: QRCodeMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: QRCodeMaxAggregateInputType;
};
export type GetQRCodeAggregateType<T extends QRCodeAggregateArgs> = {
    [P in keyof T & keyof AggregateQRCode]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateQRCode[P]> : Prisma.GetScalarType<T[P], AggregateQRCode[P]>;
};
export type QRCodeGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.QRCodeWhereInput;
    orderBy?: Prisma.QRCodeOrderByWithAggregationInput | Prisma.QRCodeOrderByWithAggregationInput[];
    by: Prisma.QRCodeScalarFieldEnum[] | Prisma.QRCodeScalarFieldEnum;
    having?: Prisma.QRCodeScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: QRCodeCountAggregateInputType | true;
    _avg?: QRCodeAvgAggregateInputType;
    _sum?: QRCodeSumAggregateInputType;
    _min?: QRCodeMinAggregateInputType;
    _max?: QRCodeMaxAggregateInputType;
};
export type QRCodeGroupByOutputType = {
    id: string;
    code: string;
    batchId: string;
    unitNumber: number | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: QRCodeCountAggregateOutputType | null;
    _avg: QRCodeAvgAggregateOutputType | null;
    _sum: QRCodeSumAggregateOutputType | null;
    _min: QRCodeMinAggregateOutputType | null;
    _max: QRCodeMaxAggregateOutputType | null;
};
type GetQRCodeGroupByPayload<T extends QRCodeGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<QRCodeGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof QRCodeGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], QRCodeGroupByOutputType[P]> : Prisma.GetScalarType<T[P], QRCodeGroupByOutputType[P]>;
}>>;
export type QRCodeWhereInput = {
    AND?: Prisma.QRCodeWhereInput | Prisma.QRCodeWhereInput[];
    OR?: Prisma.QRCodeWhereInput[];
    NOT?: Prisma.QRCodeWhereInput | Prisma.QRCodeWhereInput[];
    id?: Prisma.StringFilter<"QRCode"> | string;
    code?: Prisma.StringFilter<"QRCode"> | string;
    batchId?: Prisma.StringFilter<"QRCode"> | string;
    unitNumber?: Prisma.IntNullableFilter<"QRCode"> | number | null;
    isActive?: Prisma.BoolFilter<"QRCode"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"QRCode"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"QRCode"> | Date | string;
    batch?: Prisma.XOR<Prisma.BatchScalarRelationFilter, Prisma.BatchWhereInput>;
    scanLogs?: Prisma.ScanLogListRelationFilter;
};
export type QRCodeOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    batchId?: Prisma.SortOrder;
    unitNumber?: Prisma.SortOrderInput | Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    batch?: Prisma.BatchOrderByWithRelationInput;
    scanLogs?: Prisma.ScanLogOrderByRelationAggregateInput;
};
export type QRCodeWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    code?: string;
    AND?: Prisma.QRCodeWhereInput | Prisma.QRCodeWhereInput[];
    OR?: Prisma.QRCodeWhereInput[];
    NOT?: Prisma.QRCodeWhereInput | Prisma.QRCodeWhereInput[];
    batchId?: Prisma.StringFilter<"QRCode"> | string;
    unitNumber?: Prisma.IntNullableFilter<"QRCode"> | number | null;
    isActive?: Prisma.BoolFilter<"QRCode"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"QRCode"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"QRCode"> | Date | string;
    batch?: Prisma.XOR<Prisma.BatchScalarRelationFilter, Prisma.BatchWhereInput>;
    scanLogs?: Prisma.ScanLogListRelationFilter;
}, "id" | "code">;
export type QRCodeOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    batchId?: Prisma.SortOrder;
    unitNumber?: Prisma.SortOrderInput | Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.QRCodeCountOrderByAggregateInput;
    _avg?: Prisma.QRCodeAvgOrderByAggregateInput;
    _max?: Prisma.QRCodeMaxOrderByAggregateInput;
    _min?: Prisma.QRCodeMinOrderByAggregateInput;
    _sum?: Prisma.QRCodeSumOrderByAggregateInput;
};
export type QRCodeScalarWhereWithAggregatesInput = {
    AND?: Prisma.QRCodeScalarWhereWithAggregatesInput | Prisma.QRCodeScalarWhereWithAggregatesInput[];
    OR?: Prisma.QRCodeScalarWhereWithAggregatesInput[];
    NOT?: Prisma.QRCodeScalarWhereWithAggregatesInput | Prisma.QRCodeScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"QRCode"> | string;
    code?: Prisma.StringWithAggregatesFilter<"QRCode"> | string;
    batchId?: Prisma.StringWithAggregatesFilter<"QRCode"> | string;
    unitNumber?: Prisma.IntNullableWithAggregatesFilter<"QRCode"> | number | null;
    isActive?: Prisma.BoolWithAggregatesFilter<"QRCode"> | boolean;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"QRCode"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"QRCode"> | Date | string;
};
export type QRCodeCreateInput = {
    id?: string;
    code: string;
    unitNumber?: number | null;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    batch: Prisma.BatchCreateNestedOneWithoutQrCodesInput;
    scanLogs?: Prisma.ScanLogCreateNestedManyWithoutQrCodeInput;
};
export type QRCodeUncheckedCreateInput = {
    id?: string;
    code: string;
    batchId: string;
    unitNumber?: number | null;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    scanLogs?: Prisma.ScanLogUncheckedCreateNestedManyWithoutQrCodeInput;
};
export type QRCodeUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    unitNumber?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    batch?: Prisma.BatchUpdateOneRequiredWithoutQrCodesNestedInput;
    scanLogs?: Prisma.ScanLogUpdateManyWithoutQrCodeNestedInput;
};
export type QRCodeUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    batchId?: Prisma.StringFieldUpdateOperationsInput | string;
    unitNumber?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scanLogs?: Prisma.ScanLogUncheckedUpdateManyWithoutQrCodeNestedInput;
};
export type QRCodeCreateManyInput = {
    id?: string;
    code: string;
    batchId: string;
    unitNumber?: number | null;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type QRCodeUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    unitNumber?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type QRCodeUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    batchId?: Prisma.StringFieldUpdateOperationsInput | string;
    unitNumber?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type QRCodeListRelationFilter = {
    every?: Prisma.QRCodeWhereInput;
    some?: Prisma.QRCodeWhereInput;
    none?: Prisma.QRCodeWhereInput;
};
export type QRCodeOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type QRCodeCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    batchId?: Prisma.SortOrder;
    unitNumber?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type QRCodeAvgOrderByAggregateInput = {
    unitNumber?: Prisma.SortOrder;
};
export type QRCodeMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    batchId?: Prisma.SortOrder;
    unitNumber?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type QRCodeMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    code?: Prisma.SortOrder;
    batchId?: Prisma.SortOrder;
    unitNumber?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type QRCodeSumOrderByAggregateInput = {
    unitNumber?: Prisma.SortOrder;
};
export type QRCodeScalarRelationFilter = {
    is?: Prisma.QRCodeWhereInput;
    isNot?: Prisma.QRCodeWhereInput;
};
export type QRCodeCreateNestedManyWithoutBatchInput = {
    create?: Prisma.XOR<Prisma.QRCodeCreateWithoutBatchInput, Prisma.QRCodeUncheckedCreateWithoutBatchInput> | Prisma.QRCodeCreateWithoutBatchInput[] | Prisma.QRCodeUncheckedCreateWithoutBatchInput[];
    connectOrCreate?: Prisma.QRCodeCreateOrConnectWithoutBatchInput | Prisma.QRCodeCreateOrConnectWithoutBatchInput[];
    createMany?: Prisma.QRCodeCreateManyBatchInputEnvelope;
    connect?: Prisma.QRCodeWhereUniqueInput | Prisma.QRCodeWhereUniqueInput[];
};
export type QRCodeUncheckedCreateNestedManyWithoutBatchInput = {
    create?: Prisma.XOR<Prisma.QRCodeCreateWithoutBatchInput, Prisma.QRCodeUncheckedCreateWithoutBatchInput> | Prisma.QRCodeCreateWithoutBatchInput[] | Prisma.QRCodeUncheckedCreateWithoutBatchInput[];
    connectOrCreate?: Prisma.QRCodeCreateOrConnectWithoutBatchInput | Prisma.QRCodeCreateOrConnectWithoutBatchInput[];
    createMany?: Prisma.QRCodeCreateManyBatchInputEnvelope;
    connect?: Prisma.QRCodeWhereUniqueInput | Prisma.QRCodeWhereUniqueInput[];
};
export type QRCodeUpdateManyWithoutBatchNestedInput = {
    create?: Prisma.XOR<Prisma.QRCodeCreateWithoutBatchInput, Prisma.QRCodeUncheckedCreateWithoutBatchInput> | Prisma.QRCodeCreateWithoutBatchInput[] | Prisma.QRCodeUncheckedCreateWithoutBatchInput[];
    connectOrCreate?: Prisma.QRCodeCreateOrConnectWithoutBatchInput | Prisma.QRCodeCreateOrConnectWithoutBatchInput[];
    upsert?: Prisma.QRCodeUpsertWithWhereUniqueWithoutBatchInput | Prisma.QRCodeUpsertWithWhereUniqueWithoutBatchInput[];
    createMany?: Prisma.QRCodeCreateManyBatchInputEnvelope;
    set?: Prisma.QRCodeWhereUniqueInput | Prisma.QRCodeWhereUniqueInput[];
    disconnect?: Prisma.QRCodeWhereUniqueInput | Prisma.QRCodeWhereUniqueInput[];
    delete?: Prisma.QRCodeWhereUniqueInput | Prisma.QRCodeWhereUniqueInput[];
    connect?: Prisma.QRCodeWhereUniqueInput | Prisma.QRCodeWhereUniqueInput[];
    update?: Prisma.QRCodeUpdateWithWhereUniqueWithoutBatchInput | Prisma.QRCodeUpdateWithWhereUniqueWithoutBatchInput[];
    updateMany?: Prisma.QRCodeUpdateManyWithWhereWithoutBatchInput | Prisma.QRCodeUpdateManyWithWhereWithoutBatchInput[];
    deleteMany?: Prisma.QRCodeScalarWhereInput | Prisma.QRCodeScalarWhereInput[];
};
export type QRCodeUncheckedUpdateManyWithoutBatchNestedInput = {
    create?: Prisma.XOR<Prisma.QRCodeCreateWithoutBatchInput, Prisma.QRCodeUncheckedCreateWithoutBatchInput> | Prisma.QRCodeCreateWithoutBatchInput[] | Prisma.QRCodeUncheckedCreateWithoutBatchInput[];
    connectOrCreate?: Prisma.QRCodeCreateOrConnectWithoutBatchInput | Prisma.QRCodeCreateOrConnectWithoutBatchInput[];
    upsert?: Prisma.QRCodeUpsertWithWhereUniqueWithoutBatchInput | Prisma.QRCodeUpsertWithWhereUniqueWithoutBatchInput[];
    createMany?: Prisma.QRCodeCreateManyBatchInputEnvelope;
    set?: Prisma.QRCodeWhereUniqueInput | Prisma.QRCodeWhereUniqueInput[];
    disconnect?: Prisma.QRCodeWhereUniqueInput | Prisma.QRCodeWhereUniqueInput[];
    delete?: Prisma.QRCodeWhereUniqueInput | Prisma.QRCodeWhereUniqueInput[];
    connect?: Prisma.QRCodeWhereUniqueInput | Prisma.QRCodeWhereUniqueInput[];
    update?: Prisma.QRCodeUpdateWithWhereUniqueWithoutBatchInput | Prisma.QRCodeUpdateWithWhereUniqueWithoutBatchInput[];
    updateMany?: Prisma.QRCodeUpdateManyWithWhereWithoutBatchInput | Prisma.QRCodeUpdateManyWithWhereWithoutBatchInput[];
    deleteMany?: Prisma.QRCodeScalarWhereInput | Prisma.QRCodeScalarWhereInput[];
};
export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type QRCodeCreateNestedOneWithoutScanLogsInput = {
    create?: Prisma.XOR<Prisma.QRCodeCreateWithoutScanLogsInput, Prisma.QRCodeUncheckedCreateWithoutScanLogsInput>;
    connectOrCreate?: Prisma.QRCodeCreateOrConnectWithoutScanLogsInput;
    connect?: Prisma.QRCodeWhereUniqueInput;
};
export type QRCodeUpdateOneRequiredWithoutScanLogsNestedInput = {
    create?: Prisma.XOR<Prisma.QRCodeCreateWithoutScanLogsInput, Prisma.QRCodeUncheckedCreateWithoutScanLogsInput>;
    connectOrCreate?: Prisma.QRCodeCreateOrConnectWithoutScanLogsInput;
    upsert?: Prisma.QRCodeUpsertWithoutScanLogsInput;
    connect?: Prisma.QRCodeWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.QRCodeUpdateToOneWithWhereWithoutScanLogsInput, Prisma.QRCodeUpdateWithoutScanLogsInput>, Prisma.QRCodeUncheckedUpdateWithoutScanLogsInput>;
};
export type QRCodeCreateWithoutBatchInput = {
    id?: string;
    code: string;
    unitNumber?: number | null;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    scanLogs?: Prisma.ScanLogCreateNestedManyWithoutQrCodeInput;
};
export type QRCodeUncheckedCreateWithoutBatchInput = {
    id?: string;
    code: string;
    unitNumber?: number | null;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    scanLogs?: Prisma.ScanLogUncheckedCreateNestedManyWithoutQrCodeInput;
};
export type QRCodeCreateOrConnectWithoutBatchInput = {
    where: Prisma.QRCodeWhereUniqueInput;
    create: Prisma.XOR<Prisma.QRCodeCreateWithoutBatchInput, Prisma.QRCodeUncheckedCreateWithoutBatchInput>;
};
export type QRCodeCreateManyBatchInputEnvelope = {
    data: Prisma.QRCodeCreateManyBatchInput | Prisma.QRCodeCreateManyBatchInput[];
    skipDuplicates?: boolean;
};
export type QRCodeUpsertWithWhereUniqueWithoutBatchInput = {
    where: Prisma.QRCodeWhereUniqueInput;
    update: Prisma.XOR<Prisma.QRCodeUpdateWithoutBatchInput, Prisma.QRCodeUncheckedUpdateWithoutBatchInput>;
    create: Prisma.XOR<Prisma.QRCodeCreateWithoutBatchInput, Prisma.QRCodeUncheckedCreateWithoutBatchInput>;
};
export type QRCodeUpdateWithWhereUniqueWithoutBatchInput = {
    where: Prisma.QRCodeWhereUniqueInput;
    data: Prisma.XOR<Prisma.QRCodeUpdateWithoutBatchInput, Prisma.QRCodeUncheckedUpdateWithoutBatchInput>;
};
export type QRCodeUpdateManyWithWhereWithoutBatchInput = {
    where: Prisma.QRCodeScalarWhereInput;
    data: Prisma.XOR<Prisma.QRCodeUpdateManyMutationInput, Prisma.QRCodeUncheckedUpdateManyWithoutBatchInput>;
};
export type QRCodeScalarWhereInput = {
    AND?: Prisma.QRCodeScalarWhereInput | Prisma.QRCodeScalarWhereInput[];
    OR?: Prisma.QRCodeScalarWhereInput[];
    NOT?: Prisma.QRCodeScalarWhereInput | Prisma.QRCodeScalarWhereInput[];
    id?: Prisma.StringFilter<"QRCode"> | string;
    code?: Prisma.StringFilter<"QRCode"> | string;
    batchId?: Prisma.StringFilter<"QRCode"> | string;
    unitNumber?: Prisma.IntNullableFilter<"QRCode"> | number | null;
    isActive?: Prisma.BoolFilter<"QRCode"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"QRCode"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"QRCode"> | Date | string;
};
export type QRCodeCreateWithoutScanLogsInput = {
    id?: string;
    code: string;
    unitNumber?: number | null;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    batch: Prisma.BatchCreateNestedOneWithoutQrCodesInput;
};
export type QRCodeUncheckedCreateWithoutScanLogsInput = {
    id?: string;
    code: string;
    batchId: string;
    unitNumber?: number | null;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type QRCodeCreateOrConnectWithoutScanLogsInput = {
    where: Prisma.QRCodeWhereUniqueInput;
    create: Prisma.XOR<Prisma.QRCodeCreateWithoutScanLogsInput, Prisma.QRCodeUncheckedCreateWithoutScanLogsInput>;
};
export type QRCodeUpsertWithoutScanLogsInput = {
    update: Prisma.XOR<Prisma.QRCodeUpdateWithoutScanLogsInput, Prisma.QRCodeUncheckedUpdateWithoutScanLogsInput>;
    create: Prisma.XOR<Prisma.QRCodeCreateWithoutScanLogsInput, Prisma.QRCodeUncheckedCreateWithoutScanLogsInput>;
    where?: Prisma.QRCodeWhereInput;
};
export type QRCodeUpdateToOneWithWhereWithoutScanLogsInput = {
    where?: Prisma.QRCodeWhereInput;
    data: Prisma.XOR<Prisma.QRCodeUpdateWithoutScanLogsInput, Prisma.QRCodeUncheckedUpdateWithoutScanLogsInput>;
};
export type QRCodeUpdateWithoutScanLogsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    unitNumber?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    batch?: Prisma.BatchUpdateOneRequiredWithoutQrCodesNestedInput;
};
export type QRCodeUncheckedUpdateWithoutScanLogsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    batchId?: Prisma.StringFieldUpdateOperationsInput | string;
    unitNumber?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type QRCodeCreateManyBatchInput = {
    id?: string;
    code: string;
    unitNumber?: number | null;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type QRCodeUpdateWithoutBatchInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    unitNumber?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scanLogs?: Prisma.ScanLogUpdateManyWithoutQrCodeNestedInput;
};
export type QRCodeUncheckedUpdateWithoutBatchInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    unitNumber?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scanLogs?: Prisma.ScanLogUncheckedUpdateManyWithoutQrCodeNestedInput;
};
export type QRCodeUncheckedUpdateManyWithoutBatchInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    code?: Prisma.StringFieldUpdateOperationsInput | string;
    unitNumber?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
/**
 * Count Type QRCodeCountOutputType
 */
export type QRCodeCountOutputType = {
    scanLogs: number;
};
export type QRCodeCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    scanLogs?: boolean | QRCodeCountOutputTypeCountScanLogsArgs;
};
/**
 * QRCodeCountOutputType without action
 */
export type QRCodeCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QRCodeCountOutputType
     */
    select?: Prisma.QRCodeCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * QRCodeCountOutputType without action
 */
export type QRCodeCountOutputTypeCountScanLogsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ScanLogWhereInput;
};
export type QRCodeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    batchId?: boolean;
    unitNumber?: boolean;
    isActive?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    batch?: boolean | Prisma.BatchDefaultArgs<ExtArgs>;
    scanLogs?: boolean | Prisma.QRCode$scanLogsArgs<ExtArgs>;
    _count?: boolean | Prisma.QRCodeCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["qRCode"]>;
export type QRCodeSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    batchId?: boolean;
    unitNumber?: boolean;
    isActive?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    batch?: boolean | Prisma.BatchDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["qRCode"]>;
export type QRCodeSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    batchId?: boolean;
    unitNumber?: boolean;
    isActive?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    batch?: boolean | Prisma.BatchDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["qRCode"]>;
export type QRCodeSelectScalar = {
    id?: boolean;
    code?: boolean;
    batchId?: boolean;
    unitNumber?: boolean;
    isActive?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type QRCodeOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "code" | "batchId" | "unitNumber" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["qRCode"]>;
export type QRCodeInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    batch?: boolean | Prisma.BatchDefaultArgs<ExtArgs>;
    scanLogs?: boolean | Prisma.QRCode$scanLogsArgs<ExtArgs>;
    _count?: boolean | Prisma.QRCodeCountOutputTypeDefaultArgs<ExtArgs>;
};
export type QRCodeIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    batch?: boolean | Prisma.BatchDefaultArgs<ExtArgs>;
};
export type QRCodeIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    batch?: boolean | Prisma.BatchDefaultArgs<ExtArgs>;
};
export type $QRCodePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "QRCode";
    objects: {
        batch: Prisma.$BatchPayload<ExtArgs>;
        scanLogs: Prisma.$ScanLogPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        code: string;
        batchId: string;
        unitNumber: number | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["qRCode"]>;
    composites: {};
};
export type QRCodeGetPayload<S extends boolean | null | undefined | QRCodeDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$QRCodePayload, S>;
export type QRCodeCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<QRCodeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: QRCodeCountAggregateInputType | true;
};
export interface QRCodeDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['QRCode'];
        meta: {
            name: 'QRCode';
        };
    };
    /**
     * Find zero or one QRCode that matches the filter.
     * @param {QRCodeFindUniqueArgs} args - Arguments to find a QRCode
     * @example
     * // Get one QRCode
     * const qRCode = await prisma.qRCode.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends QRCodeFindUniqueArgs>(args: Prisma.SelectSubset<T, QRCodeFindUniqueArgs<ExtArgs>>): Prisma.Prisma__QRCodeClient<runtime.Types.Result.GetResult<Prisma.$QRCodePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one QRCode that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {QRCodeFindUniqueOrThrowArgs} args - Arguments to find a QRCode
     * @example
     * // Get one QRCode
     * const qRCode = await prisma.qRCode.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends QRCodeFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, QRCodeFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__QRCodeClient<runtime.Types.Result.GetResult<Prisma.$QRCodePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first QRCode that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QRCodeFindFirstArgs} args - Arguments to find a QRCode
     * @example
     * // Get one QRCode
     * const qRCode = await prisma.qRCode.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends QRCodeFindFirstArgs>(args?: Prisma.SelectSubset<T, QRCodeFindFirstArgs<ExtArgs>>): Prisma.Prisma__QRCodeClient<runtime.Types.Result.GetResult<Prisma.$QRCodePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first QRCode that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QRCodeFindFirstOrThrowArgs} args - Arguments to find a QRCode
     * @example
     * // Get one QRCode
     * const qRCode = await prisma.qRCode.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends QRCodeFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, QRCodeFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__QRCodeClient<runtime.Types.Result.GetResult<Prisma.$QRCodePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more QRCodes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QRCodeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all QRCodes
     * const qRCodes = await prisma.qRCode.findMany()
     *
     * // Get first 10 QRCodes
     * const qRCodes = await prisma.qRCode.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const qRCodeWithIdOnly = await prisma.qRCode.findMany({ select: { id: true } })
     *
     */
    findMany<T extends QRCodeFindManyArgs>(args?: Prisma.SelectSubset<T, QRCodeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$QRCodePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a QRCode.
     * @param {QRCodeCreateArgs} args - Arguments to create a QRCode.
     * @example
     * // Create one QRCode
     * const QRCode = await prisma.qRCode.create({
     *   data: {
     *     // ... data to create a QRCode
     *   }
     * })
     *
     */
    create<T extends QRCodeCreateArgs>(args: Prisma.SelectSubset<T, QRCodeCreateArgs<ExtArgs>>): Prisma.Prisma__QRCodeClient<runtime.Types.Result.GetResult<Prisma.$QRCodePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many QRCodes.
     * @param {QRCodeCreateManyArgs} args - Arguments to create many QRCodes.
     * @example
     * // Create many QRCodes
     * const qRCode = await prisma.qRCode.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends QRCodeCreateManyArgs>(args?: Prisma.SelectSubset<T, QRCodeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many QRCodes and returns the data saved in the database.
     * @param {QRCodeCreateManyAndReturnArgs} args - Arguments to create many QRCodes.
     * @example
     * // Create many QRCodes
     * const qRCode = await prisma.qRCode.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many QRCodes and only return the `id`
     * const qRCodeWithIdOnly = await prisma.qRCode.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends QRCodeCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, QRCodeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$QRCodePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a QRCode.
     * @param {QRCodeDeleteArgs} args - Arguments to delete one QRCode.
     * @example
     * // Delete one QRCode
     * const QRCode = await prisma.qRCode.delete({
     *   where: {
     *     // ... filter to delete one QRCode
     *   }
     * })
     *
     */
    delete<T extends QRCodeDeleteArgs>(args: Prisma.SelectSubset<T, QRCodeDeleteArgs<ExtArgs>>): Prisma.Prisma__QRCodeClient<runtime.Types.Result.GetResult<Prisma.$QRCodePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one QRCode.
     * @param {QRCodeUpdateArgs} args - Arguments to update one QRCode.
     * @example
     * // Update one QRCode
     * const qRCode = await prisma.qRCode.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends QRCodeUpdateArgs>(args: Prisma.SelectSubset<T, QRCodeUpdateArgs<ExtArgs>>): Prisma.Prisma__QRCodeClient<runtime.Types.Result.GetResult<Prisma.$QRCodePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more QRCodes.
     * @param {QRCodeDeleteManyArgs} args - Arguments to filter QRCodes to delete.
     * @example
     * // Delete a few QRCodes
     * const { count } = await prisma.qRCode.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends QRCodeDeleteManyArgs>(args?: Prisma.SelectSubset<T, QRCodeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more QRCodes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QRCodeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many QRCodes
     * const qRCode = await prisma.qRCode.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends QRCodeUpdateManyArgs>(args: Prisma.SelectSubset<T, QRCodeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more QRCodes and returns the data updated in the database.
     * @param {QRCodeUpdateManyAndReturnArgs} args - Arguments to update many QRCodes.
     * @example
     * // Update many QRCodes
     * const qRCode = await prisma.qRCode.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more QRCodes and only return the `id`
     * const qRCodeWithIdOnly = await prisma.qRCode.updateManyAndReturn({
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
    updateManyAndReturn<T extends QRCodeUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, QRCodeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$QRCodePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one QRCode.
     * @param {QRCodeUpsertArgs} args - Arguments to update or create a QRCode.
     * @example
     * // Update or create a QRCode
     * const qRCode = await prisma.qRCode.upsert({
     *   create: {
     *     // ... data to create a QRCode
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the QRCode we want to update
     *   }
     * })
     */
    upsert<T extends QRCodeUpsertArgs>(args: Prisma.SelectSubset<T, QRCodeUpsertArgs<ExtArgs>>): Prisma.Prisma__QRCodeClient<runtime.Types.Result.GetResult<Prisma.$QRCodePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of QRCodes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QRCodeCountArgs} args - Arguments to filter QRCodes to count.
     * @example
     * // Count the number of QRCodes
     * const count = await prisma.qRCode.count({
     *   where: {
     *     // ... the filter for the QRCodes we want to count
     *   }
     * })
    **/
    count<T extends QRCodeCountArgs>(args?: Prisma.Subset<T, QRCodeCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], QRCodeCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a QRCode.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QRCodeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends QRCodeAggregateArgs>(args: Prisma.Subset<T, QRCodeAggregateArgs>): Prisma.PrismaPromise<GetQRCodeAggregateType<T>>;
    /**
     * Group by QRCode.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QRCodeGroupByArgs} args - Group by arguments.
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
    groupBy<T extends QRCodeGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: QRCodeGroupByArgs['orderBy'];
    } : {
        orderBy?: QRCodeGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, QRCodeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetQRCodeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the QRCode model
     */
    readonly fields: QRCodeFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for QRCode.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__QRCodeClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    batch<T extends Prisma.BatchDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.BatchDefaultArgs<ExtArgs>>): Prisma.Prisma__BatchClient<runtime.Types.Result.GetResult<Prisma.$BatchPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    scanLogs<T extends Prisma.QRCode$scanLogsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.QRCode$scanLogsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ScanLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
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
 * Fields of the QRCode model
 */
export interface QRCodeFieldRefs {
    readonly id: Prisma.FieldRef<"QRCode", 'String'>;
    readonly code: Prisma.FieldRef<"QRCode", 'String'>;
    readonly batchId: Prisma.FieldRef<"QRCode", 'String'>;
    readonly unitNumber: Prisma.FieldRef<"QRCode", 'Int'>;
    readonly isActive: Prisma.FieldRef<"QRCode", 'Boolean'>;
    readonly createdAt: Prisma.FieldRef<"QRCode", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"QRCode", 'DateTime'>;
}
/**
 * QRCode findUnique
 */
export type QRCodeFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QRCode
     */
    select?: Prisma.QRCodeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the QRCode
     */
    omit?: Prisma.QRCodeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.QRCodeInclude<ExtArgs> | null;
    /**
     * Filter, which QRCode to fetch.
     */
    where: Prisma.QRCodeWhereUniqueInput;
};
/**
 * QRCode findUniqueOrThrow
 */
export type QRCodeFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QRCode
     */
    select?: Prisma.QRCodeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the QRCode
     */
    omit?: Prisma.QRCodeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.QRCodeInclude<ExtArgs> | null;
    /**
     * Filter, which QRCode to fetch.
     */
    where: Prisma.QRCodeWhereUniqueInput;
};
/**
 * QRCode findFirst
 */
export type QRCodeFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QRCode
     */
    select?: Prisma.QRCodeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the QRCode
     */
    omit?: Prisma.QRCodeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.QRCodeInclude<ExtArgs> | null;
    /**
     * Filter, which QRCode to fetch.
     */
    where?: Prisma.QRCodeWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of QRCodes to fetch.
     */
    orderBy?: Prisma.QRCodeOrderByWithRelationInput | Prisma.QRCodeOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for QRCodes.
     */
    cursor?: Prisma.QRCodeWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` QRCodes from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` QRCodes.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of QRCodes.
     */
    distinct?: Prisma.QRCodeScalarFieldEnum | Prisma.QRCodeScalarFieldEnum[];
};
/**
 * QRCode findFirstOrThrow
 */
export type QRCodeFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QRCode
     */
    select?: Prisma.QRCodeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the QRCode
     */
    omit?: Prisma.QRCodeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.QRCodeInclude<ExtArgs> | null;
    /**
     * Filter, which QRCode to fetch.
     */
    where?: Prisma.QRCodeWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of QRCodes to fetch.
     */
    orderBy?: Prisma.QRCodeOrderByWithRelationInput | Prisma.QRCodeOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for QRCodes.
     */
    cursor?: Prisma.QRCodeWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` QRCodes from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` QRCodes.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of QRCodes.
     */
    distinct?: Prisma.QRCodeScalarFieldEnum | Prisma.QRCodeScalarFieldEnum[];
};
/**
 * QRCode findMany
 */
export type QRCodeFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QRCode
     */
    select?: Prisma.QRCodeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the QRCode
     */
    omit?: Prisma.QRCodeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.QRCodeInclude<ExtArgs> | null;
    /**
     * Filter, which QRCodes to fetch.
     */
    where?: Prisma.QRCodeWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of QRCodes to fetch.
     */
    orderBy?: Prisma.QRCodeOrderByWithRelationInput | Prisma.QRCodeOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing QRCodes.
     */
    cursor?: Prisma.QRCodeWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` QRCodes from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` QRCodes.
     */
    skip?: number;
    distinct?: Prisma.QRCodeScalarFieldEnum | Prisma.QRCodeScalarFieldEnum[];
};
/**
 * QRCode create
 */
export type QRCodeCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QRCode
     */
    select?: Prisma.QRCodeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the QRCode
     */
    omit?: Prisma.QRCodeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.QRCodeInclude<ExtArgs> | null;
    /**
     * The data needed to create a QRCode.
     */
    data: Prisma.XOR<Prisma.QRCodeCreateInput, Prisma.QRCodeUncheckedCreateInput>;
};
/**
 * QRCode createMany
 */
export type QRCodeCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many QRCodes.
     */
    data: Prisma.QRCodeCreateManyInput | Prisma.QRCodeCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * QRCode createManyAndReturn
 */
export type QRCodeCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QRCode
     */
    select?: Prisma.QRCodeSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the QRCode
     */
    omit?: Prisma.QRCodeOmit<ExtArgs> | null;
    /**
     * The data used to create many QRCodes.
     */
    data: Prisma.QRCodeCreateManyInput | Prisma.QRCodeCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.QRCodeIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * QRCode update
 */
export type QRCodeUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QRCode
     */
    select?: Prisma.QRCodeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the QRCode
     */
    omit?: Prisma.QRCodeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.QRCodeInclude<ExtArgs> | null;
    /**
     * The data needed to update a QRCode.
     */
    data: Prisma.XOR<Prisma.QRCodeUpdateInput, Prisma.QRCodeUncheckedUpdateInput>;
    /**
     * Choose, which QRCode to update.
     */
    where: Prisma.QRCodeWhereUniqueInput;
};
/**
 * QRCode updateMany
 */
export type QRCodeUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update QRCodes.
     */
    data: Prisma.XOR<Prisma.QRCodeUpdateManyMutationInput, Prisma.QRCodeUncheckedUpdateManyInput>;
    /**
     * Filter which QRCodes to update
     */
    where?: Prisma.QRCodeWhereInput;
    /**
     * Limit how many QRCodes to update.
     */
    limit?: number;
};
/**
 * QRCode updateManyAndReturn
 */
export type QRCodeUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QRCode
     */
    select?: Prisma.QRCodeSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the QRCode
     */
    omit?: Prisma.QRCodeOmit<ExtArgs> | null;
    /**
     * The data used to update QRCodes.
     */
    data: Prisma.XOR<Prisma.QRCodeUpdateManyMutationInput, Prisma.QRCodeUncheckedUpdateManyInput>;
    /**
     * Filter which QRCodes to update
     */
    where?: Prisma.QRCodeWhereInput;
    /**
     * Limit how many QRCodes to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.QRCodeIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * QRCode upsert
 */
export type QRCodeUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QRCode
     */
    select?: Prisma.QRCodeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the QRCode
     */
    omit?: Prisma.QRCodeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.QRCodeInclude<ExtArgs> | null;
    /**
     * The filter to search for the QRCode to update in case it exists.
     */
    where: Prisma.QRCodeWhereUniqueInput;
    /**
     * In case the QRCode found by the `where` argument doesn't exist, create a new QRCode with this data.
     */
    create: Prisma.XOR<Prisma.QRCodeCreateInput, Prisma.QRCodeUncheckedCreateInput>;
    /**
     * In case the QRCode was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.QRCodeUpdateInput, Prisma.QRCodeUncheckedUpdateInput>;
};
/**
 * QRCode delete
 */
export type QRCodeDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QRCode
     */
    select?: Prisma.QRCodeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the QRCode
     */
    omit?: Prisma.QRCodeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.QRCodeInclude<ExtArgs> | null;
    /**
     * Filter which QRCode to delete.
     */
    where: Prisma.QRCodeWhereUniqueInput;
};
/**
 * QRCode deleteMany
 */
export type QRCodeDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which QRCodes to delete
     */
    where?: Prisma.QRCodeWhereInput;
    /**
     * Limit how many QRCodes to delete.
     */
    limit?: number;
};
/**
 * QRCode.scanLogs
 */
export type QRCode$scanLogsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    where?: Prisma.ScanLogWhereInput;
    orderBy?: Prisma.ScanLogOrderByWithRelationInput | Prisma.ScanLogOrderByWithRelationInput[];
    cursor?: Prisma.ScanLogWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ScanLogScalarFieldEnum | Prisma.ScanLogScalarFieldEnum[];
};
/**
 * QRCode without action
 */
export type QRCodeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QRCode
     */
    select?: Prisma.QRCodeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the QRCode
     */
    omit?: Prisma.QRCodeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.QRCodeInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=QRCode.d.ts.map