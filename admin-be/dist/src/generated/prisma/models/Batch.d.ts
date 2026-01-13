/**
 * This file exports the `Batch` model and its related types.
 *
 * 🟢 You can import this file directly.
 */
import * as runtime from "@prisma/client/runtime/library";
import type * as $Enums from "../enums";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model Batch
 *
 */
export type BatchModel = runtime.Types.Result.DefaultSelection<Prisma.$BatchPayload>;
export type AggregateBatch = {
    _count: BatchCountAggregateOutputType | null;
    _avg: BatchAvgAggregateOutputType | null;
    _sum: BatchSumAggregateOutputType | null;
    _min: BatchMinAggregateOutputType | null;
    _max: BatchMaxAggregateOutputType | null;
};
export type BatchAvgAggregateOutputType = {
    quantity: number | null;
};
export type BatchSumAggregateOutputType = {
    quantity: number | null;
};
export type BatchMinAggregateOutputType = {
    id: string | null;
    batchHash: string | null;
    manufacturingDate: Date | null;
    expiryDate: Date | null;
    status: $Enums.BatchStatus | null;
    createdAt: Date | null;
    blockchainTxHash: string | null;
    blockchainPda: string | null;
    batchNumber: string | null;
    manufacturerId: string | null;
    medicineId: string | null;
    quantity: number | null;
    invoiceNumber: string | null;
    invoiceDate: Date | null;
    gstNumber: string | null;
    warehouseLocation: string | null;
    warehouseAddress: string | null;
    lifecycleStatus: $Enums.LifecycleStatus | null;
    updatedAt: Date | null;
};
export type BatchMaxAggregateOutputType = {
    id: string | null;
    batchHash: string | null;
    manufacturingDate: Date | null;
    expiryDate: Date | null;
    status: $Enums.BatchStatus | null;
    createdAt: Date | null;
    blockchainTxHash: string | null;
    blockchainPda: string | null;
    batchNumber: string | null;
    manufacturerId: string | null;
    medicineId: string | null;
    quantity: number | null;
    invoiceNumber: string | null;
    invoiceDate: Date | null;
    gstNumber: string | null;
    warehouseLocation: string | null;
    warehouseAddress: string | null;
    lifecycleStatus: $Enums.LifecycleStatus | null;
    updatedAt: Date | null;
};
export type BatchCountAggregateOutputType = {
    id: number;
    batchHash: number;
    manufacturingDate: number;
    expiryDate: number;
    status: number;
    createdAt: number;
    blockchainTxHash: number;
    blockchainPda: number;
    batchNumber: number;
    manufacturerId: number;
    medicineId: number;
    quantity: number;
    invoiceNumber: number;
    invoiceDate: number;
    gstNumber: number;
    warehouseLocation: number;
    warehouseAddress: number;
    lifecycleStatus: number;
    updatedAt: number;
    _all: number;
};
export type BatchAvgAggregateInputType = {
    quantity?: true;
};
export type BatchSumAggregateInputType = {
    quantity?: true;
};
export type BatchMinAggregateInputType = {
    id?: true;
    batchHash?: true;
    manufacturingDate?: true;
    expiryDate?: true;
    status?: true;
    createdAt?: true;
    blockchainTxHash?: true;
    blockchainPda?: true;
    batchNumber?: true;
    manufacturerId?: true;
    medicineId?: true;
    quantity?: true;
    invoiceNumber?: true;
    invoiceDate?: true;
    gstNumber?: true;
    warehouseLocation?: true;
    warehouseAddress?: true;
    lifecycleStatus?: true;
    updatedAt?: true;
};
export type BatchMaxAggregateInputType = {
    id?: true;
    batchHash?: true;
    manufacturingDate?: true;
    expiryDate?: true;
    status?: true;
    createdAt?: true;
    blockchainTxHash?: true;
    blockchainPda?: true;
    batchNumber?: true;
    manufacturerId?: true;
    medicineId?: true;
    quantity?: true;
    invoiceNumber?: true;
    invoiceDate?: true;
    gstNumber?: true;
    warehouseLocation?: true;
    warehouseAddress?: true;
    lifecycleStatus?: true;
    updatedAt?: true;
};
export type BatchCountAggregateInputType = {
    id?: true;
    batchHash?: true;
    manufacturingDate?: true;
    expiryDate?: true;
    status?: true;
    createdAt?: true;
    blockchainTxHash?: true;
    blockchainPda?: true;
    batchNumber?: true;
    manufacturerId?: true;
    medicineId?: true;
    quantity?: true;
    invoiceNumber?: true;
    invoiceDate?: true;
    gstNumber?: true;
    warehouseLocation?: true;
    warehouseAddress?: true;
    lifecycleStatus?: true;
    updatedAt?: true;
    _all?: true;
};
export type BatchAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Batch to aggregate.
     */
    where?: Prisma.BatchWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Batches to fetch.
     */
    orderBy?: Prisma.BatchOrderByWithRelationInput | Prisma.BatchOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.BatchWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Batches from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Batches.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Batches
    **/
    _count?: true | BatchCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: BatchAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: BatchSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: BatchMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: BatchMaxAggregateInputType;
};
export type GetBatchAggregateType<T extends BatchAggregateArgs> = {
    [P in keyof T & keyof AggregateBatch]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateBatch[P]> : Prisma.GetScalarType<T[P], AggregateBatch[P]>;
};
export type BatchGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.BatchWhereInput;
    orderBy?: Prisma.BatchOrderByWithAggregationInput | Prisma.BatchOrderByWithAggregationInput[];
    by: Prisma.BatchScalarFieldEnum[] | Prisma.BatchScalarFieldEnum;
    having?: Prisma.BatchScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: BatchCountAggregateInputType | true;
    _avg?: BatchAvgAggregateInputType;
    _sum?: BatchSumAggregateInputType;
    _min?: BatchMinAggregateInputType;
    _max?: BatchMaxAggregateInputType;
};
export type BatchGroupByOutputType = {
    id: string;
    batchHash: string;
    manufacturingDate: Date;
    expiryDate: Date;
    status: $Enums.BatchStatus;
    createdAt: Date;
    blockchainTxHash: string | null;
    blockchainPda: string | null;
    batchNumber: string;
    manufacturerId: string;
    medicineId: string;
    quantity: number;
    invoiceNumber: string | null;
    invoiceDate: Date | null;
    gstNumber: string | null;
    warehouseLocation: string | null;
    warehouseAddress: string | null;
    lifecycleStatus: $Enums.LifecycleStatus;
    updatedAt: Date;
    _count: BatchCountAggregateOutputType | null;
    _avg: BatchAvgAggregateOutputType | null;
    _sum: BatchSumAggregateOutputType | null;
    _min: BatchMinAggregateOutputType | null;
    _max: BatchMaxAggregateOutputType | null;
};
type GetBatchGroupByPayload<T extends BatchGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<BatchGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof BatchGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], BatchGroupByOutputType[P]> : Prisma.GetScalarType<T[P], BatchGroupByOutputType[P]>;
}>>;
export type BatchWhereInput = {
    AND?: Prisma.BatchWhereInput | Prisma.BatchWhereInput[];
    OR?: Prisma.BatchWhereInput[];
    NOT?: Prisma.BatchWhereInput | Prisma.BatchWhereInput[];
    id?: Prisma.StringFilter<"Batch"> | string;
    batchHash?: Prisma.StringFilter<"Batch"> | string;
    manufacturingDate?: Prisma.DateTimeFilter<"Batch"> | Date | string;
    expiryDate?: Prisma.DateTimeFilter<"Batch"> | Date | string;
    status?: Prisma.EnumBatchStatusFilter<"Batch"> | $Enums.BatchStatus;
    createdAt?: Prisma.DateTimeFilter<"Batch"> | Date | string;
    blockchainTxHash?: Prisma.StringNullableFilter<"Batch"> | string | null;
    blockchainPda?: Prisma.StringNullableFilter<"Batch"> | string | null;
    batchNumber?: Prisma.StringFilter<"Batch"> | string;
    manufacturerId?: Prisma.StringFilter<"Batch"> | string;
    medicineId?: Prisma.StringFilter<"Batch"> | string;
    quantity?: Prisma.IntFilter<"Batch"> | number;
    invoiceNumber?: Prisma.StringNullableFilter<"Batch"> | string | null;
    invoiceDate?: Prisma.DateTimeNullableFilter<"Batch"> | Date | string | null;
    gstNumber?: Prisma.StringNullableFilter<"Batch"> | string | null;
    warehouseLocation?: Prisma.StringNullableFilter<"Batch"> | string | null;
    warehouseAddress?: Prisma.StringNullableFilter<"Batch"> | string | null;
    lifecycleStatus?: Prisma.EnumLifecycleStatusFilter<"Batch"> | $Enums.LifecycleStatus;
    updatedAt?: Prisma.DateTimeFilter<"Batch"> | Date | string;
    manufacturer?: Prisma.XOR<Prisma.ManufacturerScalarRelationFilter, Prisma.ManufacturerWhereInput>;
    medicine?: Prisma.XOR<Prisma.MedicineScalarRelationFilter, Prisma.MedicineWhereInput>;
    qrCodes?: Prisma.QRCodeListRelationFilter;
    scanLogs?: Prisma.ScanLogListRelationFilter;
};
export type BatchOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    batchHash?: Prisma.SortOrder;
    manufacturingDate?: Prisma.SortOrder;
    expiryDate?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    blockchainTxHash?: Prisma.SortOrderInput | Prisma.SortOrder;
    blockchainPda?: Prisma.SortOrderInput | Prisma.SortOrder;
    batchNumber?: Prisma.SortOrder;
    manufacturerId?: Prisma.SortOrder;
    medicineId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    invoiceNumber?: Prisma.SortOrderInput | Prisma.SortOrder;
    invoiceDate?: Prisma.SortOrderInput | Prisma.SortOrder;
    gstNumber?: Prisma.SortOrderInput | Prisma.SortOrder;
    warehouseLocation?: Prisma.SortOrderInput | Prisma.SortOrder;
    warehouseAddress?: Prisma.SortOrderInput | Prisma.SortOrder;
    lifecycleStatus?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    manufacturer?: Prisma.ManufacturerOrderByWithRelationInput;
    medicine?: Prisma.MedicineOrderByWithRelationInput;
    qrCodes?: Prisma.QRCodeOrderByRelationAggregateInput;
    scanLogs?: Prisma.ScanLogOrderByRelationAggregateInput;
};
export type BatchWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    batchHash?: string;
    blockchainTxHash?: string;
    blockchainPda?: string;
    batchNumber?: string;
    AND?: Prisma.BatchWhereInput | Prisma.BatchWhereInput[];
    OR?: Prisma.BatchWhereInput[];
    NOT?: Prisma.BatchWhereInput | Prisma.BatchWhereInput[];
    manufacturingDate?: Prisma.DateTimeFilter<"Batch"> | Date | string;
    expiryDate?: Prisma.DateTimeFilter<"Batch"> | Date | string;
    status?: Prisma.EnumBatchStatusFilter<"Batch"> | $Enums.BatchStatus;
    createdAt?: Prisma.DateTimeFilter<"Batch"> | Date | string;
    manufacturerId?: Prisma.StringFilter<"Batch"> | string;
    medicineId?: Prisma.StringFilter<"Batch"> | string;
    quantity?: Prisma.IntFilter<"Batch"> | number;
    invoiceNumber?: Prisma.StringNullableFilter<"Batch"> | string | null;
    invoiceDate?: Prisma.DateTimeNullableFilter<"Batch"> | Date | string | null;
    gstNumber?: Prisma.StringNullableFilter<"Batch"> | string | null;
    warehouseLocation?: Prisma.StringNullableFilter<"Batch"> | string | null;
    warehouseAddress?: Prisma.StringNullableFilter<"Batch"> | string | null;
    lifecycleStatus?: Prisma.EnumLifecycleStatusFilter<"Batch"> | $Enums.LifecycleStatus;
    updatedAt?: Prisma.DateTimeFilter<"Batch"> | Date | string;
    manufacturer?: Prisma.XOR<Prisma.ManufacturerScalarRelationFilter, Prisma.ManufacturerWhereInput>;
    medicine?: Prisma.XOR<Prisma.MedicineScalarRelationFilter, Prisma.MedicineWhereInput>;
    qrCodes?: Prisma.QRCodeListRelationFilter;
    scanLogs?: Prisma.ScanLogListRelationFilter;
}, "id" | "batchHash" | "blockchainTxHash" | "blockchainPda" | "batchNumber">;
export type BatchOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    batchHash?: Prisma.SortOrder;
    manufacturingDate?: Prisma.SortOrder;
    expiryDate?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    blockchainTxHash?: Prisma.SortOrderInput | Prisma.SortOrder;
    blockchainPda?: Prisma.SortOrderInput | Prisma.SortOrder;
    batchNumber?: Prisma.SortOrder;
    manufacturerId?: Prisma.SortOrder;
    medicineId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    invoiceNumber?: Prisma.SortOrderInput | Prisma.SortOrder;
    invoiceDate?: Prisma.SortOrderInput | Prisma.SortOrder;
    gstNumber?: Prisma.SortOrderInput | Prisma.SortOrder;
    warehouseLocation?: Prisma.SortOrderInput | Prisma.SortOrder;
    warehouseAddress?: Prisma.SortOrderInput | Prisma.SortOrder;
    lifecycleStatus?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.BatchCountOrderByAggregateInput;
    _avg?: Prisma.BatchAvgOrderByAggregateInput;
    _max?: Prisma.BatchMaxOrderByAggregateInput;
    _min?: Prisma.BatchMinOrderByAggregateInput;
    _sum?: Prisma.BatchSumOrderByAggregateInput;
};
export type BatchScalarWhereWithAggregatesInput = {
    AND?: Prisma.BatchScalarWhereWithAggregatesInput | Prisma.BatchScalarWhereWithAggregatesInput[];
    OR?: Prisma.BatchScalarWhereWithAggregatesInput[];
    NOT?: Prisma.BatchScalarWhereWithAggregatesInput | Prisma.BatchScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Batch"> | string;
    batchHash?: Prisma.StringWithAggregatesFilter<"Batch"> | string;
    manufacturingDate?: Prisma.DateTimeWithAggregatesFilter<"Batch"> | Date | string;
    expiryDate?: Prisma.DateTimeWithAggregatesFilter<"Batch"> | Date | string;
    status?: Prisma.EnumBatchStatusWithAggregatesFilter<"Batch"> | $Enums.BatchStatus;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Batch"> | Date | string;
    blockchainTxHash?: Prisma.StringNullableWithAggregatesFilter<"Batch"> | string | null;
    blockchainPda?: Prisma.StringNullableWithAggregatesFilter<"Batch"> | string | null;
    batchNumber?: Prisma.StringWithAggregatesFilter<"Batch"> | string;
    manufacturerId?: Prisma.StringWithAggregatesFilter<"Batch"> | string;
    medicineId?: Prisma.StringWithAggregatesFilter<"Batch"> | string;
    quantity?: Prisma.IntWithAggregatesFilter<"Batch"> | number;
    invoiceNumber?: Prisma.StringNullableWithAggregatesFilter<"Batch"> | string | null;
    invoiceDate?: Prisma.DateTimeNullableWithAggregatesFilter<"Batch"> | Date | string | null;
    gstNumber?: Prisma.StringNullableWithAggregatesFilter<"Batch"> | string | null;
    warehouseLocation?: Prisma.StringNullableWithAggregatesFilter<"Batch"> | string | null;
    warehouseAddress?: Prisma.StringNullableWithAggregatesFilter<"Batch"> | string | null;
    lifecycleStatus?: Prisma.EnumLifecycleStatusWithAggregatesFilter<"Batch"> | $Enums.LifecycleStatus;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Batch"> | Date | string;
};
export type BatchCreateInput = {
    id?: string;
    batchHash: string;
    manufacturingDate: Date | string;
    expiryDate: Date | string;
    status?: $Enums.BatchStatus;
    createdAt?: Date | string;
    blockchainTxHash?: string | null;
    blockchainPda?: string | null;
    batchNumber: string;
    quantity: number;
    invoiceNumber?: string | null;
    invoiceDate?: Date | string | null;
    gstNumber?: string | null;
    warehouseLocation?: string | null;
    warehouseAddress?: string | null;
    lifecycleStatus?: $Enums.LifecycleStatus;
    updatedAt?: Date | string;
    manufacturer: Prisma.ManufacturerCreateNestedOneWithoutBatchesInput;
    medicine: Prisma.MedicineCreateNestedOneWithoutBatchesInput;
    qrCodes?: Prisma.QRCodeCreateNestedManyWithoutBatchInput;
    scanLogs?: Prisma.ScanLogCreateNestedManyWithoutBatchInput;
};
export type BatchUncheckedCreateInput = {
    id?: string;
    batchHash: string;
    manufacturingDate: Date | string;
    expiryDate: Date | string;
    status?: $Enums.BatchStatus;
    createdAt?: Date | string;
    blockchainTxHash?: string | null;
    blockchainPda?: string | null;
    batchNumber: string;
    manufacturerId: string;
    medicineId: string;
    quantity: number;
    invoiceNumber?: string | null;
    invoiceDate?: Date | string | null;
    gstNumber?: string | null;
    warehouseLocation?: string | null;
    warehouseAddress?: string | null;
    lifecycleStatus?: $Enums.LifecycleStatus;
    updatedAt?: Date | string;
    qrCodes?: Prisma.QRCodeUncheckedCreateNestedManyWithoutBatchInput;
    scanLogs?: Prisma.ScanLogUncheckedCreateNestedManyWithoutBatchInput;
};
export type BatchUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    batchHash?: Prisma.StringFieldUpdateOperationsInput | string;
    manufacturingDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expiryDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumBatchStatusFieldUpdateOperationsInput | $Enums.BatchStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    blockchainTxHash?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    blockchainPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    batchNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    invoiceNumber?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    invoiceDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    gstNumber?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    warehouseLocation?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    warehouseAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lifecycleStatus?: Prisma.EnumLifecycleStatusFieldUpdateOperationsInput | $Enums.LifecycleStatus;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    manufacturer?: Prisma.ManufacturerUpdateOneRequiredWithoutBatchesNestedInput;
    medicine?: Prisma.MedicineUpdateOneRequiredWithoutBatchesNestedInput;
    qrCodes?: Prisma.QRCodeUpdateManyWithoutBatchNestedInput;
    scanLogs?: Prisma.ScanLogUpdateManyWithoutBatchNestedInput;
};
export type BatchUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    batchHash?: Prisma.StringFieldUpdateOperationsInput | string;
    manufacturingDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expiryDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumBatchStatusFieldUpdateOperationsInput | $Enums.BatchStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    blockchainTxHash?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    blockchainPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    batchNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    manufacturerId?: Prisma.StringFieldUpdateOperationsInput | string;
    medicineId?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    invoiceNumber?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    invoiceDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    gstNumber?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    warehouseLocation?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    warehouseAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lifecycleStatus?: Prisma.EnumLifecycleStatusFieldUpdateOperationsInput | $Enums.LifecycleStatus;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    qrCodes?: Prisma.QRCodeUncheckedUpdateManyWithoutBatchNestedInput;
    scanLogs?: Prisma.ScanLogUncheckedUpdateManyWithoutBatchNestedInput;
};
export type BatchCreateManyInput = {
    id?: string;
    batchHash: string;
    manufacturingDate: Date | string;
    expiryDate: Date | string;
    status?: $Enums.BatchStatus;
    createdAt?: Date | string;
    blockchainTxHash?: string | null;
    blockchainPda?: string | null;
    batchNumber: string;
    manufacturerId: string;
    medicineId: string;
    quantity: number;
    invoiceNumber?: string | null;
    invoiceDate?: Date | string | null;
    gstNumber?: string | null;
    warehouseLocation?: string | null;
    warehouseAddress?: string | null;
    lifecycleStatus?: $Enums.LifecycleStatus;
    updatedAt?: Date | string;
};
export type BatchUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    batchHash?: Prisma.StringFieldUpdateOperationsInput | string;
    manufacturingDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expiryDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumBatchStatusFieldUpdateOperationsInput | $Enums.BatchStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    blockchainTxHash?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    blockchainPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    batchNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    invoiceNumber?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    invoiceDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    gstNumber?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    warehouseLocation?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    warehouseAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lifecycleStatus?: Prisma.EnumLifecycleStatusFieldUpdateOperationsInput | $Enums.LifecycleStatus;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type BatchUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    batchHash?: Prisma.StringFieldUpdateOperationsInput | string;
    manufacturingDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expiryDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumBatchStatusFieldUpdateOperationsInput | $Enums.BatchStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    blockchainTxHash?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    blockchainPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    batchNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    manufacturerId?: Prisma.StringFieldUpdateOperationsInput | string;
    medicineId?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    invoiceNumber?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    invoiceDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    gstNumber?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    warehouseLocation?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    warehouseAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lifecycleStatus?: Prisma.EnumLifecycleStatusFieldUpdateOperationsInput | $Enums.LifecycleStatus;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type BatchListRelationFilter = {
    every?: Prisma.BatchWhereInput;
    some?: Prisma.BatchWhereInput;
    none?: Prisma.BatchWhereInput;
};
export type BatchOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type BatchCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    batchHash?: Prisma.SortOrder;
    manufacturingDate?: Prisma.SortOrder;
    expiryDate?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    blockchainTxHash?: Prisma.SortOrder;
    blockchainPda?: Prisma.SortOrder;
    batchNumber?: Prisma.SortOrder;
    manufacturerId?: Prisma.SortOrder;
    medicineId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    invoiceNumber?: Prisma.SortOrder;
    invoiceDate?: Prisma.SortOrder;
    gstNumber?: Prisma.SortOrder;
    warehouseLocation?: Prisma.SortOrder;
    warehouseAddress?: Prisma.SortOrder;
    lifecycleStatus?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type BatchAvgOrderByAggregateInput = {
    quantity?: Prisma.SortOrder;
};
export type BatchMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    batchHash?: Prisma.SortOrder;
    manufacturingDate?: Prisma.SortOrder;
    expiryDate?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    blockchainTxHash?: Prisma.SortOrder;
    blockchainPda?: Prisma.SortOrder;
    batchNumber?: Prisma.SortOrder;
    manufacturerId?: Prisma.SortOrder;
    medicineId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    invoiceNumber?: Prisma.SortOrder;
    invoiceDate?: Prisma.SortOrder;
    gstNumber?: Prisma.SortOrder;
    warehouseLocation?: Prisma.SortOrder;
    warehouseAddress?: Prisma.SortOrder;
    lifecycleStatus?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type BatchMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    batchHash?: Prisma.SortOrder;
    manufacturingDate?: Prisma.SortOrder;
    expiryDate?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    blockchainTxHash?: Prisma.SortOrder;
    blockchainPda?: Prisma.SortOrder;
    batchNumber?: Prisma.SortOrder;
    manufacturerId?: Prisma.SortOrder;
    medicineId?: Prisma.SortOrder;
    quantity?: Prisma.SortOrder;
    invoiceNumber?: Prisma.SortOrder;
    invoiceDate?: Prisma.SortOrder;
    gstNumber?: Prisma.SortOrder;
    warehouseLocation?: Prisma.SortOrder;
    warehouseAddress?: Prisma.SortOrder;
    lifecycleStatus?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type BatchSumOrderByAggregateInput = {
    quantity?: Prisma.SortOrder;
};
export type BatchScalarRelationFilter = {
    is?: Prisma.BatchWhereInput;
    isNot?: Prisma.BatchWhereInput;
};
export type BatchCreateNestedManyWithoutManufacturerInput = {
    create?: Prisma.XOR<Prisma.BatchCreateWithoutManufacturerInput, Prisma.BatchUncheckedCreateWithoutManufacturerInput> | Prisma.BatchCreateWithoutManufacturerInput[] | Prisma.BatchUncheckedCreateWithoutManufacturerInput[];
    connectOrCreate?: Prisma.BatchCreateOrConnectWithoutManufacturerInput | Prisma.BatchCreateOrConnectWithoutManufacturerInput[];
    createMany?: Prisma.BatchCreateManyManufacturerInputEnvelope;
    connect?: Prisma.BatchWhereUniqueInput | Prisma.BatchWhereUniqueInput[];
};
export type BatchUncheckedCreateNestedManyWithoutManufacturerInput = {
    create?: Prisma.XOR<Prisma.BatchCreateWithoutManufacturerInput, Prisma.BatchUncheckedCreateWithoutManufacturerInput> | Prisma.BatchCreateWithoutManufacturerInput[] | Prisma.BatchUncheckedCreateWithoutManufacturerInput[];
    connectOrCreate?: Prisma.BatchCreateOrConnectWithoutManufacturerInput | Prisma.BatchCreateOrConnectWithoutManufacturerInput[];
    createMany?: Prisma.BatchCreateManyManufacturerInputEnvelope;
    connect?: Prisma.BatchWhereUniqueInput | Prisma.BatchWhereUniqueInput[];
};
export type BatchUpdateManyWithoutManufacturerNestedInput = {
    create?: Prisma.XOR<Prisma.BatchCreateWithoutManufacturerInput, Prisma.BatchUncheckedCreateWithoutManufacturerInput> | Prisma.BatchCreateWithoutManufacturerInput[] | Prisma.BatchUncheckedCreateWithoutManufacturerInput[];
    connectOrCreate?: Prisma.BatchCreateOrConnectWithoutManufacturerInput | Prisma.BatchCreateOrConnectWithoutManufacturerInput[];
    upsert?: Prisma.BatchUpsertWithWhereUniqueWithoutManufacturerInput | Prisma.BatchUpsertWithWhereUniqueWithoutManufacturerInput[];
    createMany?: Prisma.BatchCreateManyManufacturerInputEnvelope;
    set?: Prisma.BatchWhereUniqueInput | Prisma.BatchWhereUniqueInput[];
    disconnect?: Prisma.BatchWhereUniqueInput | Prisma.BatchWhereUniqueInput[];
    delete?: Prisma.BatchWhereUniqueInput | Prisma.BatchWhereUniqueInput[];
    connect?: Prisma.BatchWhereUniqueInput | Prisma.BatchWhereUniqueInput[];
    update?: Prisma.BatchUpdateWithWhereUniqueWithoutManufacturerInput | Prisma.BatchUpdateWithWhereUniqueWithoutManufacturerInput[];
    updateMany?: Prisma.BatchUpdateManyWithWhereWithoutManufacturerInput | Prisma.BatchUpdateManyWithWhereWithoutManufacturerInput[];
    deleteMany?: Prisma.BatchScalarWhereInput | Prisma.BatchScalarWhereInput[];
};
export type BatchUncheckedUpdateManyWithoutManufacturerNestedInput = {
    create?: Prisma.XOR<Prisma.BatchCreateWithoutManufacturerInput, Prisma.BatchUncheckedCreateWithoutManufacturerInput> | Prisma.BatchCreateWithoutManufacturerInput[] | Prisma.BatchUncheckedCreateWithoutManufacturerInput[];
    connectOrCreate?: Prisma.BatchCreateOrConnectWithoutManufacturerInput | Prisma.BatchCreateOrConnectWithoutManufacturerInput[];
    upsert?: Prisma.BatchUpsertWithWhereUniqueWithoutManufacturerInput | Prisma.BatchUpsertWithWhereUniqueWithoutManufacturerInput[];
    createMany?: Prisma.BatchCreateManyManufacturerInputEnvelope;
    set?: Prisma.BatchWhereUniqueInput | Prisma.BatchWhereUniqueInput[];
    disconnect?: Prisma.BatchWhereUniqueInput | Prisma.BatchWhereUniqueInput[];
    delete?: Prisma.BatchWhereUniqueInput | Prisma.BatchWhereUniqueInput[];
    connect?: Prisma.BatchWhereUniqueInput | Prisma.BatchWhereUniqueInput[];
    update?: Prisma.BatchUpdateWithWhereUniqueWithoutManufacturerInput | Prisma.BatchUpdateWithWhereUniqueWithoutManufacturerInput[];
    updateMany?: Prisma.BatchUpdateManyWithWhereWithoutManufacturerInput | Prisma.BatchUpdateManyWithWhereWithoutManufacturerInput[];
    deleteMany?: Prisma.BatchScalarWhereInput | Prisma.BatchScalarWhereInput[];
};
export type BatchCreateNestedManyWithoutMedicineInput = {
    create?: Prisma.XOR<Prisma.BatchCreateWithoutMedicineInput, Prisma.BatchUncheckedCreateWithoutMedicineInput> | Prisma.BatchCreateWithoutMedicineInput[] | Prisma.BatchUncheckedCreateWithoutMedicineInput[];
    connectOrCreate?: Prisma.BatchCreateOrConnectWithoutMedicineInput | Prisma.BatchCreateOrConnectWithoutMedicineInput[];
    createMany?: Prisma.BatchCreateManyMedicineInputEnvelope;
    connect?: Prisma.BatchWhereUniqueInput | Prisma.BatchWhereUniqueInput[];
};
export type BatchUncheckedCreateNestedManyWithoutMedicineInput = {
    create?: Prisma.XOR<Prisma.BatchCreateWithoutMedicineInput, Prisma.BatchUncheckedCreateWithoutMedicineInput> | Prisma.BatchCreateWithoutMedicineInput[] | Prisma.BatchUncheckedCreateWithoutMedicineInput[];
    connectOrCreate?: Prisma.BatchCreateOrConnectWithoutMedicineInput | Prisma.BatchCreateOrConnectWithoutMedicineInput[];
    createMany?: Prisma.BatchCreateManyMedicineInputEnvelope;
    connect?: Prisma.BatchWhereUniqueInput | Prisma.BatchWhereUniqueInput[];
};
export type BatchUpdateManyWithoutMedicineNestedInput = {
    create?: Prisma.XOR<Prisma.BatchCreateWithoutMedicineInput, Prisma.BatchUncheckedCreateWithoutMedicineInput> | Prisma.BatchCreateWithoutMedicineInput[] | Prisma.BatchUncheckedCreateWithoutMedicineInput[];
    connectOrCreate?: Prisma.BatchCreateOrConnectWithoutMedicineInput | Prisma.BatchCreateOrConnectWithoutMedicineInput[];
    upsert?: Prisma.BatchUpsertWithWhereUniqueWithoutMedicineInput | Prisma.BatchUpsertWithWhereUniqueWithoutMedicineInput[];
    createMany?: Prisma.BatchCreateManyMedicineInputEnvelope;
    set?: Prisma.BatchWhereUniqueInput | Prisma.BatchWhereUniqueInput[];
    disconnect?: Prisma.BatchWhereUniqueInput | Prisma.BatchWhereUniqueInput[];
    delete?: Prisma.BatchWhereUniqueInput | Prisma.BatchWhereUniqueInput[];
    connect?: Prisma.BatchWhereUniqueInput | Prisma.BatchWhereUniqueInput[];
    update?: Prisma.BatchUpdateWithWhereUniqueWithoutMedicineInput | Prisma.BatchUpdateWithWhereUniqueWithoutMedicineInput[];
    updateMany?: Prisma.BatchUpdateManyWithWhereWithoutMedicineInput | Prisma.BatchUpdateManyWithWhereWithoutMedicineInput[];
    deleteMany?: Prisma.BatchScalarWhereInput | Prisma.BatchScalarWhereInput[];
};
export type BatchUncheckedUpdateManyWithoutMedicineNestedInput = {
    create?: Prisma.XOR<Prisma.BatchCreateWithoutMedicineInput, Prisma.BatchUncheckedCreateWithoutMedicineInput> | Prisma.BatchCreateWithoutMedicineInput[] | Prisma.BatchUncheckedCreateWithoutMedicineInput[];
    connectOrCreate?: Prisma.BatchCreateOrConnectWithoutMedicineInput | Prisma.BatchCreateOrConnectWithoutMedicineInput[];
    upsert?: Prisma.BatchUpsertWithWhereUniqueWithoutMedicineInput | Prisma.BatchUpsertWithWhereUniqueWithoutMedicineInput[];
    createMany?: Prisma.BatchCreateManyMedicineInputEnvelope;
    set?: Prisma.BatchWhereUniqueInput | Prisma.BatchWhereUniqueInput[];
    disconnect?: Prisma.BatchWhereUniqueInput | Prisma.BatchWhereUniqueInput[];
    delete?: Prisma.BatchWhereUniqueInput | Prisma.BatchWhereUniqueInput[];
    connect?: Prisma.BatchWhereUniqueInput | Prisma.BatchWhereUniqueInput[];
    update?: Prisma.BatchUpdateWithWhereUniqueWithoutMedicineInput | Prisma.BatchUpdateWithWhereUniqueWithoutMedicineInput[];
    updateMany?: Prisma.BatchUpdateManyWithWhereWithoutMedicineInput | Prisma.BatchUpdateManyWithWhereWithoutMedicineInput[];
    deleteMany?: Prisma.BatchScalarWhereInput | Prisma.BatchScalarWhereInput[];
};
export type EnumBatchStatusFieldUpdateOperationsInput = {
    set?: $Enums.BatchStatus;
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null;
};
export type EnumLifecycleStatusFieldUpdateOperationsInput = {
    set?: $Enums.LifecycleStatus;
};
export type BatchCreateNestedOneWithoutQrCodesInput = {
    create?: Prisma.XOR<Prisma.BatchCreateWithoutQrCodesInput, Prisma.BatchUncheckedCreateWithoutQrCodesInput>;
    connectOrCreate?: Prisma.BatchCreateOrConnectWithoutQrCodesInput;
    connect?: Prisma.BatchWhereUniqueInput;
};
export type BatchUpdateOneRequiredWithoutQrCodesNestedInput = {
    create?: Prisma.XOR<Prisma.BatchCreateWithoutQrCodesInput, Prisma.BatchUncheckedCreateWithoutQrCodesInput>;
    connectOrCreate?: Prisma.BatchCreateOrConnectWithoutQrCodesInput;
    upsert?: Prisma.BatchUpsertWithoutQrCodesInput;
    connect?: Prisma.BatchWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.BatchUpdateToOneWithWhereWithoutQrCodesInput, Prisma.BatchUpdateWithoutQrCodesInput>, Prisma.BatchUncheckedUpdateWithoutQrCodesInput>;
};
export type BatchCreateNestedOneWithoutScanLogsInput = {
    create?: Prisma.XOR<Prisma.BatchCreateWithoutScanLogsInput, Prisma.BatchUncheckedCreateWithoutScanLogsInput>;
    connectOrCreate?: Prisma.BatchCreateOrConnectWithoutScanLogsInput;
    connect?: Prisma.BatchWhereUniqueInput;
};
export type BatchUpdateOneRequiredWithoutScanLogsNestedInput = {
    create?: Prisma.XOR<Prisma.BatchCreateWithoutScanLogsInput, Prisma.BatchUncheckedCreateWithoutScanLogsInput>;
    connectOrCreate?: Prisma.BatchCreateOrConnectWithoutScanLogsInput;
    upsert?: Prisma.BatchUpsertWithoutScanLogsInput;
    connect?: Prisma.BatchWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.BatchUpdateToOneWithWhereWithoutScanLogsInput, Prisma.BatchUpdateWithoutScanLogsInput>, Prisma.BatchUncheckedUpdateWithoutScanLogsInput>;
};
export type BatchCreateWithoutManufacturerInput = {
    id?: string;
    batchHash: string;
    manufacturingDate: Date | string;
    expiryDate: Date | string;
    status?: $Enums.BatchStatus;
    createdAt?: Date | string;
    blockchainTxHash?: string | null;
    blockchainPda?: string | null;
    batchNumber: string;
    quantity: number;
    invoiceNumber?: string | null;
    invoiceDate?: Date | string | null;
    gstNumber?: string | null;
    warehouseLocation?: string | null;
    warehouseAddress?: string | null;
    lifecycleStatus?: $Enums.LifecycleStatus;
    updatedAt?: Date | string;
    medicine: Prisma.MedicineCreateNestedOneWithoutBatchesInput;
    qrCodes?: Prisma.QRCodeCreateNestedManyWithoutBatchInput;
    scanLogs?: Prisma.ScanLogCreateNestedManyWithoutBatchInput;
};
export type BatchUncheckedCreateWithoutManufacturerInput = {
    id?: string;
    batchHash: string;
    manufacturingDate: Date | string;
    expiryDate: Date | string;
    status?: $Enums.BatchStatus;
    createdAt?: Date | string;
    blockchainTxHash?: string | null;
    blockchainPda?: string | null;
    batchNumber: string;
    medicineId: string;
    quantity: number;
    invoiceNumber?: string | null;
    invoiceDate?: Date | string | null;
    gstNumber?: string | null;
    warehouseLocation?: string | null;
    warehouseAddress?: string | null;
    lifecycleStatus?: $Enums.LifecycleStatus;
    updatedAt?: Date | string;
    qrCodes?: Prisma.QRCodeUncheckedCreateNestedManyWithoutBatchInput;
    scanLogs?: Prisma.ScanLogUncheckedCreateNestedManyWithoutBatchInput;
};
export type BatchCreateOrConnectWithoutManufacturerInput = {
    where: Prisma.BatchWhereUniqueInput;
    create: Prisma.XOR<Prisma.BatchCreateWithoutManufacturerInput, Prisma.BatchUncheckedCreateWithoutManufacturerInput>;
};
export type BatchCreateManyManufacturerInputEnvelope = {
    data: Prisma.BatchCreateManyManufacturerInput | Prisma.BatchCreateManyManufacturerInput[];
    skipDuplicates?: boolean;
};
export type BatchUpsertWithWhereUniqueWithoutManufacturerInput = {
    where: Prisma.BatchWhereUniqueInput;
    update: Prisma.XOR<Prisma.BatchUpdateWithoutManufacturerInput, Prisma.BatchUncheckedUpdateWithoutManufacturerInput>;
    create: Prisma.XOR<Prisma.BatchCreateWithoutManufacturerInput, Prisma.BatchUncheckedCreateWithoutManufacturerInput>;
};
export type BatchUpdateWithWhereUniqueWithoutManufacturerInput = {
    where: Prisma.BatchWhereUniqueInput;
    data: Prisma.XOR<Prisma.BatchUpdateWithoutManufacturerInput, Prisma.BatchUncheckedUpdateWithoutManufacturerInput>;
};
export type BatchUpdateManyWithWhereWithoutManufacturerInput = {
    where: Prisma.BatchScalarWhereInput;
    data: Prisma.XOR<Prisma.BatchUpdateManyMutationInput, Prisma.BatchUncheckedUpdateManyWithoutManufacturerInput>;
};
export type BatchScalarWhereInput = {
    AND?: Prisma.BatchScalarWhereInput | Prisma.BatchScalarWhereInput[];
    OR?: Prisma.BatchScalarWhereInput[];
    NOT?: Prisma.BatchScalarWhereInput | Prisma.BatchScalarWhereInput[];
    id?: Prisma.StringFilter<"Batch"> | string;
    batchHash?: Prisma.StringFilter<"Batch"> | string;
    manufacturingDate?: Prisma.DateTimeFilter<"Batch"> | Date | string;
    expiryDate?: Prisma.DateTimeFilter<"Batch"> | Date | string;
    status?: Prisma.EnumBatchStatusFilter<"Batch"> | $Enums.BatchStatus;
    createdAt?: Prisma.DateTimeFilter<"Batch"> | Date | string;
    blockchainTxHash?: Prisma.StringNullableFilter<"Batch"> | string | null;
    blockchainPda?: Prisma.StringNullableFilter<"Batch"> | string | null;
    batchNumber?: Prisma.StringFilter<"Batch"> | string;
    manufacturerId?: Prisma.StringFilter<"Batch"> | string;
    medicineId?: Prisma.StringFilter<"Batch"> | string;
    quantity?: Prisma.IntFilter<"Batch"> | number;
    invoiceNumber?: Prisma.StringNullableFilter<"Batch"> | string | null;
    invoiceDate?: Prisma.DateTimeNullableFilter<"Batch"> | Date | string | null;
    gstNumber?: Prisma.StringNullableFilter<"Batch"> | string | null;
    warehouseLocation?: Prisma.StringNullableFilter<"Batch"> | string | null;
    warehouseAddress?: Prisma.StringNullableFilter<"Batch"> | string | null;
    lifecycleStatus?: Prisma.EnumLifecycleStatusFilter<"Batch"> | $Enums.LifecycleStatus;
    updatedAt?: Prisma.DateTimeFilter<"Batch"> | Date | string;
};
export type BatchCreateWithoutMedicineInput = {
    id?: string;
    batchHash: string;
    manufacturingDate: Date | string;
    expiryDate: Date | string;
    status?: $Enums.BatchStatus;
    createdAt?: Date | string;
    blockchainTxHash?: string | null;
    blockchainPda?: string | null;
    batchNumber: string;
    quantity: number;
    invoiceNumber?: string | null;
    invoiceDate?: Date | string | null;
    gstNumber?: string | null;
    warehouseLocation?: string | null;
    warehouseAddress?: string | null;
    lifecycleStatus?: $Enums.LifecycleStatus;
    updatedAt?: Date | string;
    manufacturer: Prisma.ManufacturerCreateNestedOneWithoutBatchesInput;
    qrCodes?: Prisma.QRCodeCreateNestedManyWithoutBatchInput;
    scanLogs?: Prisma.ScanLogCreateNestedManyWithoutBatchInput;
};
export type BatchUncheckedCreateWithoutMedicineInput = {
    id?: string;
    batchHash: string;
    manufacturingDate: Date | string;
    expiryDate: Date | string;
    status?: $Enums.BatchStatus;
    createdAt?: Date | string;
    blockchainTxHash?: string | null;
    blockchainPda?: string | null;
    batchNumber: string;
    manufacturerId: string;
    quantity: number;
    invoiceNumber?: string | null;
    invoiceDate?: Date | string | null;
    gstNumber?: string | null;
    warehouseLocation?: string | null;
    warehouseAddress?: string | null;
    lifecycleStatus?: $Enums.LifecycleStatus;
    updatedAt?: Date | string;
    qrCodes?: Prisma.QRCodeUncheckedCreateNestedManyWithoutBatchInput;
    scanLogs?: Prisma.ScanLogUncheckedCreateNestedManyWithoutBatchInput;
};
export type BatchCreateOrConnectWithoutMedicineInput = {
    where: Prisma.BatchWhereUniqueInput;
    create: Prisma.XOR<Prisma.BatchCreateWithoutMedicineInput, Prisma.BatchUncheckedCreateWithoutMedicineInput>;
};
export type BatchCreateManyMedicineInputEnvelope = {
    data: Prisma.BatchCreateManyMedicineInput | Prisma.BatchCreateManyMedicineInput[];
    skipDuplicates?: boolean;
};
export type BatchUpsertWithWhereUniqueWithoutMedicineInput = {
    where: Prisma.BatchWhereUniqueInput;
    update: Prisma.XOR<Prisma.BatchUpdateWithoutMedicineInput, Prisma.BatchUncheckedUpdateWithoutMedicineInput>;
    create: Prisma.XOR<Prisma.BatchCreateWithoutMedicineInput, Prisma.BatchUncheckedCreateWithoutMedicineInput>;
};
export type BatchUpdateWithWhereUniqueWithoutMedicineInput = {
    where: Prisma.BatchWhereUniqueInput;
    data: Prisma.XOR<Prisma.BatchUpdateWithoutMedicineInput, Prisma.BatchUncheckedUpdateWithoutMedicineInput>;
};
export type BatchUpdateManyWithWhereWithoutMedicineInput = {
    where: Prisma.BatchScalarWhereInput;
    data: Prisma.XOR<Prisma.BatchUpdateManyMutationInput, Prisma.BatchUncheckedUpdateManyWithoutMedicineInput>;
};
export type BatchCreateWithoutQrCodesInput = {
    id?: string;
    batchHash: string;
    manufacturingDate: Date | string;
    expiryDate: Date | string;
    status?: $Enums.BatchStatus;
    createdAt?: Date | string;
    blockchainTxHash?: string | null;
    blockchainPda?: string | null;
    batchNumber: string;
    quantity: number;
    invoiceNumber?: string | null;
    invoiceDate?: Date | string | null;
    gstNumber?: string | null;
    warehouseLocation?: string | null;
    warehouseAddress?: string | null;
    lifecycleStatus?: $Enums.LifecycleStatus;
    updatedAt?: Date | string;
    manufacturer: Prisma.ManufacturerCreateNestedOneWithoutBatchesInput;
    medicine: Prisma.MedicineCreateNestedOneWithoutBatchesInput;
    scanLogs?: Prisma.ScanLogCreateNestedManyWithoutBatchInput;
};
export type BatchUncheckedCreateWithoutQrCodesInput = {
    id?: string;
    batchHash: string;
    manufacturingDate: Date | string;
    expiryDate: Date | string;
    status?: $Enums.BatchStatus;
    createdAt?: Date | string;
    blockchainTxHash?: string | null;
    blockchainPda?: string | null;
    batchNumber: string;
    manufacturerId: string;
    medicineId: string;
    quantity: number;
    invoiceNumber?: string | null;
    invoiceDate?: Date | string | null;
    gstNumber?: string | null;
    warehouseLocation?: string | null;
    warehouseAddress?: string | null;
    lifecycleStatus?: $Enums.LifecycleStatus;
    updatedAt?: Date | string;
    scanLogs?: Prisma.ScanLogUncheckedCreateNestedManyWithoutBatchInput;
};
export type BatchCreateOrConnectWithoutQrCodesInput = {
    where: Prisma.BatchWhereUniqueInput;
    create: Prisma.XOR<Prisma.BatchCreateWithoutQrCodesInput, Prisma.BatchUncheckedCreateWithoutQrCodesInput>;
};
export type BatchUpsertWithoutQrCodesInput = {
    update: Prisma.XOR<Prisma.BatchUpdateWithoutQrCodesInput, Prisma.BatchUncheckedUpdateWithoutQrCodesInput>;
    create: Prisma.XOR<Prisma.BatchCreateWithoutQrCodesInput, Prisma.BatchUncheckedCreateWithoutQrCodesInput>;
    where?: Prisma.BatchWhereInput;
};
export type BatchUpdateToOneWithWhereWithoutQrCodesInput = {
    where?: Prisma.BatchWhereInput;
    data: Prisma.XOR<Prisma.BatchUpdateWithoutQrCodesInput, Prisma.BatchUncheckedUpdateWithoutQrCodesInput>;
};
export type BatchUpdateWithoutQrCodesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    batchHash?: Prisma.StringFieldUpdateOperationsInput | string;
    manufacturingDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expiryDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumBatchStatusFieldUpdateOperationsInput | $Enums.BatchStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    blockchainTxHash?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    blockchainPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    batchNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    invoiceNumber?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    invoiceDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    gstNumber?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    warehouseLocation?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    warehouseAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lifecycleStatus?: Prisma.EnumLifecycleStatusFieldUpdateOperationsInput | $Enums.LifecycleStatus;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    manufacturer?: Prisma.ManufacturerUpdateOneRequiredWithoutBatchesNestedInput;
    medicine?: Prisma.MedicineUpdateOneRequiredWithoutBatchesNestedInput;
    scanLogs?: Prisma.ScanLogUpdateManyWithoutBatchNestedInput;
};
export type BatchUncheckedUpdateWithoutQrCodesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    batchHash?: Prisma.StringFieldUpdateOperationsInput | string;
    manufacturingDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expiryDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumBatchStatusFieldUpdateOperationsInput | $Enums.BatchStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    blockchainTxHash?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    blockchainPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    batchNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    manufacturerId?: Prisma.StringFieldUpdateOperationsInput | string;
    medicineId?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    invoiceNumber?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    invoiceDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    gstNumber?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    warehouseLocation?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    warehouseAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lifecycleStatus?: Prisma.EnumLifecycleStatusFieldUpdateOperationsInput | $Enums.LifecycleStatus;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    scanLogs?: Prisma.ScanLogUncheckedUpdateManyWithoutBatchNestedInput;
};
export type BatchCreateWithoutScanLogsInput = {
    id?: string;
    batchHash: string;
    manufacturingDate: Date | string;
    expiryDate: Date | string;
    status?: $Enums.BatchStatus;
    createdAt?: Date | string;
    blockchainTxHash?: string | null;
    blockchainPda?: string | null;
    batchNumber: string;
    quantity: number;
    invoiceNumber?: string | null;
    invoiceDate?: Date | string | null;
    gstNumber?: string | null;
    warehouseLocation?: string | null;
    warehouseAddress?: string | null;
    lifecycleStatus?: $Enums.LifecycleStatus;
    updatedAt?: Date | string;
    manufacturer: Prisma.ManufacturerCreateNestedOneWithoutBatchesInput;
    medicine: Prisma.MedicineCreateNestedOneWithoutBatchesInput;
    qrCodes?: Prisma.QRCodeCreateNestedManyWithoutBatchInput;
};
export type BatchUncheckedCreateWithoutScanLogsInput = {
    id?: string;
    batchHash: string;
    manufacturingDate: Date | string;
    expiryDate: Date | string;
    status?: $Enums.BatchStatus;
    createdAt?: Date | string;
    blockchainTxHash?: string | null;
    blockchainPda?: string | null;
    batchNumber: string;
    manufacturerId: string;
    medicineId: string;
    quantity: number;
    invoiceNumber?: string | null;
    invoiceDate?: Date | string | null;
    gstNumber?: string | null;
    warehouseLocation?: string | null;
    warehouseAddress?: string | null;
    lifecycleStatus?: $Enums.LifecycleStatus;
    updatedAt?: Date | string;
    qrCodes?: Prisma.QRCodeUncheckedCreateNestedManyWithoutBatchInput;
};
export type BatchCreateOrConnectWithoutScanLogsInput = {
    where: Prisma.BatchWhereUniqueInput;
    create: Prisma.XOR<Prisma.BatchCreateWithoutScanLogsInput, Prisma.BatchUncheckedCreateWithoutScanLogsInput>;
};
export type BatchUpsertWithoutScanLogsInput = {
    update: Prisma.XOR<Prisma.BatchUpdateWithoutScanLogsInput, Prisma.BatchUncheckedUpdateWithoutScanLogsInput>;
    create: Prisma.XOR<Prisma.BatchCreateWithoutScanLogsInput, Prisma.BatchUncheckedCreateWithoutScanLogsInput>;
    where?: Prisma.BatchWhereInput;
};
export type BatchUpdateToOneWithWhereWithoutScanLogsInput = {
    where?: Prisma.BatchWhereInput;
    data: Prisma.XOR<Prisma.BatchUpdateWithoutScanLogsInput, Prisma.BatchUncheckedUpdateWithoutScanLogsInput>;
};
export type BatchUpdateWithoutScanLogsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    batchHash?: Prisma.StringFieldUpdateOperationsInput | string;
    manufacturingDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expiryDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumBatchStatusFieldUpdateOperationsInput | $Enums.BatchStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    blockchainTxHash?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    blockchainPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    batchNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    invoiceNumber?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    invoiceDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    gstNumber?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    warehouseLocation?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    warehouseAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lifecycleStatus?: Prisma.EnumLifecycleStatusFieldUpdateOperationsInput | $Enums.LifecycleStatus;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    manufacturer?: Prisma.ManufacturerUpdateOneRequiredWithoutBatchesNestedInput;
    medicine?: Prisma.MedicineUpdateOneRequiredWithoutBatchesNestedInput;
    qrCodes?: Prisma.QRCodeUpdateManyWithoutBatchNestedInput;
};
export type BatchUncheckedUpdateWithoutScanLogsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    batchHash?: Prisma.StringFieldUpdateOperationsInput | string;
    manufacturingDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expiryDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumBatchStatusFieldUpdateOperationsInput | $Enums.BatchStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    blockchainTxHash?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    blockchainPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    batchNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    manufacturerId?: Prisma.StringFieldUpdateOperationsInput | string;
    medicineId?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    invoiceNumber?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    invoiceDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    gstNumber?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    warehouseLocation?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    warehouseAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lifecycleStatus?: Prisma.EnumLifecycleStatusFieldUpdateOperationsInput | $Enums.LifecycleStatus;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    qrCodes?: Prisma.QRCodeUncheckedUpdateManyWithoutBatchNestedInput;
};
export type BatchCreateManyManufacturerInput = {
    id?: string;
    batchHash: string;
    manufacturingDate: Date | string;
    expiryDate: Date | string;
    status?: $Enums.BatchStatus;
    createdAt?: Date | string;
    blockchainTxHash?: string | null;
    blockchainPda?: string | null;
    batchNumber: string;
    medicineId: string;
    quantity: number;
    invoiceNumber?: string | null;
    invoiceDate?: Date | string | null;
    gstNumber?: string | null;
    warehouseLocation?: string | null;
    warehouseAddress?: string | null;
    lifecycleStatus?: $Enums.LifecycleStatus;
    updatedAt?: Date | string;
};
export type BatchUpdateWithoutManufacturerInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    batchHash?: Prisma.StringFieldUpdateOperationsInput | string;
    manufacturingDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expiryDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumBatchStatusFieldUpdateOperationsInput | $Enums.BatchStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    blockchainTxHash?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    blockchainPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    batchNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    invoiceNumber?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    invoiceDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    gstNumber?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    warehouseLocation?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    warehouseAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lifecycleStatus?: Prisma.EnumLifecycleStatusFieldUpdateOperationsInput | $Enums.LifecycleStatus;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    medicine?: Prisma.MedicineUpdateOneRequiredWithoutBatchesNestedInput;
    qrCodes?: Prisma.QRCodeUpdateManyWithoutBatchNestedInput;
    scanLogs?: Prisma.ScanLogUpdateManyWithoutBatchNestedInput;
};
export type BatchUncheckedUpdateWithoutManufacturerInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    batchHash?: Prisma.StringFieldUpdateOperationsInput | string;
    manufacturingDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expiryDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumBatchStatusFieldUpdateOperationsInput | $Enums.BatchStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    blockchainTxHash?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    blockchainPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    batchNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    medicineId?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    invoiceNumber?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    invoiceDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    gstNumber?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    warehouseLocation?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    warehouseAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lifecycleStatus?: Prisma.EnumLifecycleStatusFieldUpdateOperationsInput | $Enums.LifecycleStatus;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    qrCodes?: Prisma.QRCodeUncheckedUpdateManyWithoutBatchNestedInput;
    scanLogs?: Prisma.ScanLogUncheckedUpdateManyWithoutBatchNestedInput;
};
export type BatchUncheckedUpdateManyWithoutManufacturerInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    batchHash?: Prisma.StringFieldUpdateOperationsInput | string;
    manufacturingDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expiryDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumBatchStatusFieldUpdateOperationsInput | $Enums.BatchStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    blockchainTxHash?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    blockchainPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    batchNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    medicineId?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    invoiceNumber?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    invoiceDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    gstNumber?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    warehouseLocation?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    warehouseAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lifecycleStatus?: Prisma.EnumLifecycleStatusFieldUpdateOperationsInput | $Enums.LifecycleStatus;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type BatchCreateManyMedicineInput = {
    id?: string;
    batchHash: string;
    manufacturingDate: Date | string;
    expiryDate: Date | string;
    status?: $Enums.BatchStatus;
    createdAt?: Date | string;
    blockchainTxHash?: string | null;
    blockchainPda?: string | null;
    batchNumber: string;
    manufacturerId: string;
    quantity: number;
    invoiceNumber?: string | null;
    invoiceDate?: Date | string | null;
    gstNumber?: string | null;
    warehouseLocation?: string | null;
    warehouseAddress?: string | null;
    lifecycleStatus?: $Enums.LifecycleStatus;
    updatedAt?: Date | string;
};
export type BatchUpdateWithoutMedicineInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    batchHash?: Prisma.StringFieldUpdateOperationsInput | string;
    manufacturingDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expiryDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumBatchStatusFieldUpdateOperationsInput | $Enums.BatchStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    blockchainTxHash?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    blockchainPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    batchNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    invoiceNumber?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    invoiceDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    gstNumber?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    warehouseLocation?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    warehouseAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lifecycleStatus?: Prisma.EnumLifecycleStatusFieldUpdateOperationsInput | $Enums.LifecycleStatus;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    manufacturer?: Prisma.ManufacturerUpdateOneRequiredWithoutBatchesNestedInput;
    qrCodes?: Prisma.QRCodeUpdateManyWithoutBatchNestedInput;
    scanLogs?: Prisma.ScanLogUpdateManyWithoutBatchNestedInput;
};
export type BatchUncheckedUpdateWithoutMedicineInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    batchHash?: Prisma.StringFieldUpdateOperationsInput | string;
    manufacturingDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expiryDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumBatchStatusFieldUpdateOperationsInput | $Enums.BatchStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    blockchainTxHash?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    blockchainPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    batchNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    manufacturerId?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    invoiceNumber?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    invoiceDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    gstNumber?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    warehouseLocation?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    warehouseAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lifecycleStatus?: Prisma.EnumLifecycleStatusFieldUpdateOperationsInput | $Enums.LifecycleStatus;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    qrCodes?: Prisma.QRCodeUncheckedUpdateManyWithoutBatchNestedInput;
    scanLogs?: Prisma.ScanLogUncheckedUpdateManyWithoutBatchNestedInput;
};
export type BatchUncheckedUpdateManyWithoutMedicineInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    batchHash?: Prisma.StringFieldUpdateOperationsInput | string;
    manufacturingDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expiryDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.EnumBatchStatusFieldUpdateOperationsInput | $Enums.BatchStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    blockchainTxHash?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    blockchainPda?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    batchNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    manufacturerId?: Prisma.StringFieldUpdateOperationsInput | string;
    quantity?: Prisma.IntFieldUpdateOperationsInput | number;
    invoiceNumber?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    invoiceDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    gstNumber?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    warehouseLocation?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    warehouseAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lifecycleStatus?: Prisma.EnumLifecycleStatusFieldUpdateOperationsInput | $Enums.LifecycleStatus;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
/**
 * Count Type BatchCountOutputType
 */
export type BatchCountOutputType = {
    qrCodes: number;
    scanLogs: number;
};
export type BatchCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    qrCodes?: boolean | BatchCountOutputTypeCountQrCodesArgs;
    scanLogs?: boolean | BatchCountOutputTypeCountScanLogsArgs;
};
/**
 * BatchCountOutputType without action
 */
export type BatchCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BatchCountOutputType
     */
    select?: Prisma.BatchCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * BatchCountOutputType without action
 */
export type BatchCountOutputTypeCountQrCodesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.QRCodeWhereInput;
};
/**
 * BatchCountOutputType without action
 */
export type BatchCountOutputTypeCountScanLogsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ScanLogWhereInput;
};
export type BatchSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    batchHash?: boolean;
    manufacturingDate?: boolean;
    expiryDate?: boolean;
    status?: boolean;
    createdAt?: boolean;
    blockchainTxHash?: boolean;
    blockchainPda?: boolean;
    batchNumber?: boolean;
    manufacturerId?: boolean;
    medicineId?: boolean;
    quantity?: boolean;
    invoiceNumber?: boolean;
    invoiceDate?: boolean;
    gstNumber?: boolean;
    warehouseLocation?: boolean;
    warehouseAddress?: boolean;
    lifecycleStatus?: boolean;
    updatedAt?: boolean;
    manufacturer?: boolean | Prisma.ManufacturerDefaultArgs<ExtArgs>;
    medicine?: boolean | Prisma.MedicineDefaultArgs<ExtArgs>;
    qrCodes?: boolean | Prisma.Batch$qrCodesArgs<ExtArgs>;
    scanLogs?: boolean | Prisma.Batch$scanLogsArgs<ExtArgs>;
    _count?: boolean | Prisma.BatchCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["batch"]>;
export type BatchSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    batchHash?: boolean;
    manufacturingDate?: boolean;
    expiryDate?: boolean;
    status?: boolean;
    createdAt?: boolean;
    blockchainTxHash?: boolean;
    blockchainPda?: boolean;
    batchNumber?: boolean;
    manufacturerId?: boolean;
    medicineId?: boolean;
    quantity?: boolean;
    invoiceNumber?: boolean;
    invoiceDate?: boolean;
    gstNumber?: boolean;
    warehouseLocation?: boolean;
    warehouseAddress?: boolean;
    lifecycleStatus?: boolean;
    updatedAt?: boolean;
    manufacturer?: boolean | Prisma.ManufacturerDefaultArgs<ExtArgs>;
    medicine?: boolean | Prisma.MedicineDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["batch"]>;
export type BatchSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    batchHash?: boolean;
    manufacturingDate?: boolean;
    expiryDate?: boolean;
    status?: boolean;
    createdAt?: boolean;
    blockchainTxHash?: boolean;
    blockchainPda?: boolean;
    batchNumber?: boolean;
    manufacturerId?: boolean;
    medicineId?: boolean;
    quantity?: boolean;
    invoiceNumber?: boolean;
    invoiceDate?: boolean;
    gstNumber?: boolean;
    warehouseLocation?: boolean;
    warehouseAddress?: boolean;
    lifecycleStatus?: boolean;
    updatedAt?: boolean;
    manufacturer?: boolean | Prisma.ManufacturerDefaultArgs<ExtArgs>;
    medicine?: boolean | Prisma.MedicineDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["batch"]>;
export type BatchSelectScalar = {
    id?: boolean;
    batchHash?: boolean;
    manufacturingDate?: boolean;
    expiryDate?: boolean;
    status?: boolean;
    createdAt?: boolean;
    blockchainTxHash?: boolean;
    blockchainPda?: boolean;
    batchNumber?: boolean;
    manufacturerId?: boolean;
    medicineId?: boolean;
    quantity?: boolean;
    invoiceNumber?: boolean;
    invoiceDate?: boolean;
    gstNumber?: boolean;
    warehouseLocation?: boolean;
    warehouseAddress?: boolean;
    lifecycleStatus?: boolean;
    updatedAt?: boolean;
};
export type BatchOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "batchHash" | "manufacturingDate" | "expiryDate" | "status" | "createdAt" | "blockchainTxHash" | "blockchainPda" | "batchNumber" | "manufacturerId" | "medicineId" | "quantity" | "invoiceNumber" | "invoiceDate" | "gstNumber" | "warehouseLocation" | "warehouseAddress" | "lifecycleStatus" | "updatedAt", ExtArgs["result"]["batch"]>;
export type BatchInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    manufacturer?: boolean | Prisma.ManufacturerDefaultArgs<ExtArgs>;
    medicine?: boolean | Prisma.MedicineDefaultArgs<ExtArgs>;
    qrCodes?: boolean | Prisma.Batch$qrCodesArgs<ExtArgs>;
    scanLogs?: boolean | Prisma.Batch$scanLogsArgs<ExtArgs>;
    _count?: boolean | Prisma.BatchCountOutputTypeDefaultArgs<ExtArgs>;
};
export type BatchIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    manufacturer?: boolean | Prisma.ManufacturerDefaultArgs<ExtArgs>;
    medicine?: boolean | Prisma.MedicineDefaultArgs<ExtArgs>;
};
export type BatchIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    manufacturer?: boolean | Prisma.ManufacturerDefaultArgs<ExtArgs>;
    medicine?: boolean | Prisma.MedicineDefaultArgs<ExtArgs>;
};
export type $BatchPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Batch";
    objects: {
        manufacturer: Prisma.$ManufacturerPayload<ExtArgs>;
        medicine: Prisma.$MedicinePayload<ExtArgs>;
        qrCodes: Prisma.$QRCodePayload<ExtArgs>[];
        scanLogs: Prisma.$ScanLogPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        batchHash: string;
        manufacturingDate: Date;
        expiryDate: Date;
        status: $Enums.BatchStatus;
        createdAt: Date;
        blockchainTxHash: string | null;
        blockchainPda: string | null;
        batchNumber: string;
        manufacturerId: string;
        medicineId: string;
        quantity: number;
        invoiceNumber: string | null;
        invoiceDate: Date | null;
        gstNumber: string | null;
        warehouseLocation: string | null;
        warehouseAddress: string | null;
        lifecycleStatus: $Enums.LifecycleStatus;
        updatedAt: Date;
    }, ExtArgs["result"]["batch"]>;
    composites: {};
};
export type BatchGetPayload<S extends boolean | null | undefined | BatchDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$BatchPayload, S>;
export type BatchCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<BatchFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: BatchCountAggregateInputType | true;
};
export interface BatchDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Batch'];
        meta: {
            name: 'Batch';
        };
    };
    /**
     * Find zero or one Batch that matches the filter.
     * @param {BatchFindUniqueArgs} args - Arguments to find a Batch
     * @example
     * // Get one Batch
     * const batch = await prisma.batch.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BatchFindUniqueArgs>(args: Prisma.SelectSubset<T, BatchFindUniqueArgs<ExtArgs>>): Prisma.Prisma__BatchClient<runtime.Types.Result.GetResult<Prisma.$BatchPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one Batch that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BatchFindUniqueOrThrowArgs} args - Arguments to find a Batch
     * @example
     * // Get one Batch
     * const batch = await prisma.batch.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BatchFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, BatchFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__BatchClient<runtime.Types.Result.GetResult<Prisma.$BatchPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Batch that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BatchFindFirstArgs} args - Arguments to find a Batch
     * @example
     * // Get one Batch
     * const batch = await prisma.batch.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BatchFindFirstArgs>(args?: Prisma.SelectSubset<T, BatchFindFirstArgs<ExtArgs>>): Prisma.Prisma__BatchClient<runtime.Types.Result.GetResult<Prisma.$BatchPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Batch that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BatchFindFirstOrThrowArgs} args - Arguments to find a Batch
     * @example
     * // Get one Batch
     * const batch = await prisma.batch.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BatchFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, BatchFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__BatchClient<runtime.Types.Result.GetResult<Prisma.$BatchPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more Batches that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BatchFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Batches
     * const batches = await prisma.batch.findMany()
     *
     * // Get first 10 Batches
     * const batches = await prisma.batch.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const batchWithIdOnly = await prisma.batch.findMany({ select: { id: true } })
     *
     */
    findMany<T extends BatchFindManyArgs>(args?: Prisma.SelectSubset<T, BatchFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BatchPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a Batch.
     * @param {BatchCreateArgs} args - Arguments to create a Batch.
     * @example
     * // Create one Batch
     * const Batch = await prisma.batch.create({
     *   data: {
     *     // ... data to create a Batch
     *   }
     * })
     *
     */
    create<T extends BatchCreateArgs>(args: Prisma.SelectSubset<T, BatchCreateArgs<ExtArgs>>): Prisma.Prisma__BatchClient<runtime.Types.Result.GetResult<Prisma.$BatchPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many Batches.
     * @param {BatchCreateManyArgs} args - Arguments to create many Batches.
     * @example
     * // Create many Batches
     * const batch = await prisma.batch.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends BatchCreateManyArgs>(args?: Prisma.SelectSubset<T, BatchCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many Batches and returns the data saved in the database.
     * @param {BatchCreateManyAndReturnArgs} args - Arguments to create many Batches.
     * @example
     * // Create many Batches
     * const batch = await prisma.batch.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Batches and only return the `id`
     * const batchWithIdOnly = await prisma.batch.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends BatchCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, BatchCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BatchPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a Batch.
     * @param {BatchDeleteArgs} args - Arguments to delete one Batch.
     * @example
     * // Delete one Batch
     * const Batch = await prisma.batch.delete({
     *   where: {
     *     // ... filter to delete one Batch
     *   }
     * })
     *
     */
    delete<T extends BatchDeleteArgs>(args: Prisma.SelectSubset<T, BatchDeleteArgs<ExtArgs>>): Prisma.Prisma__BatchClient<runtime.Types.Result.GetResult<Prisma.$BatchPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one Batch.
     * @param {BatchUpdateArgs} args - Arguments to update one Batch.
     * @example
     * // Update one Batch
     * const batch = await prisma.batch.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends BatchUpdateArgs>(args: Prisma.SelectSubset<T, BatchUpdateArgs<ExtArgs>>): Prisma.Prisma__BatchClient<runtime.Types.Result.GetResult<Prisma.$BatchPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more Batches.
     * @param {BatchDeleteManyArgs} args - Arguments to filter Batches to delete.
     * @example
     * // Delete a few Batches
     * const { count } = await prisma.batch.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends BatchDeleteManyArgs>(args?: Prisma.SelectSubset<T, BatchDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Batches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BatchUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Batches
     * const batch = await prisma.batch.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends BatchUpdateManyArgs>(args: Prisma.SelectSubset<T, BatchUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Batches and returns the data updated in the database.
     * @param {BatchUpdateManyAndReturnArgs} args - Arguments to update many Batches.
     * @example
     * // Update many Batches
     * const batch = await prisma.batch.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Batches and only return the `id`
     * const batchWithIdOnly = await prisma.batch.updateManyAndReturn({
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
    updateManyAndReturn<T extends BatchUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, BatchUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BatchPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one Batch.
     * @param {BatchUpsertArgs} args - Arguments to update or create a Batch.
     * @example
     * // Update or create a Batch
     * const batch = await prisma.batch.upsert({
     *   create: {
     *     // ... data to create a Batch
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Batch we want to update
     *   }
     * })
     */
    upsert<T extends BatchUpsertArgs>(args: Prisma.SelectSubset<T, BatchUpsertArgs<ExtArgs>>): Prisma.Prisma__BatchClient<runtime.Types.Result.GetResult<Prisma.$BatchPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of Batches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BatchCountArgs} args - Arguments to filter Batches to count.
     * @example
     * // Count the number of Batches
     * const count = await prisma.batch.count({
     *   where: {
     *     // ... the filter for the Batches we want to count
     *   }
     * })
    **/
    count<T extends BatchCountArgs>(args?: Prisma.Subset<T, BatchCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], BatchCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a Batch.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BatchAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends BatchAggregateArgs>(args: Prisma.Subset<T, BatchAggregateArgs>): Prisma.PrismaPromise<GetBatchAggregateType<T>>;
    /**
     * Group by Batch.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BatchGroupByArgs} args - Group by arguments.
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
    groupBy<T extends BatchGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: BatchGroupByArgs['orderBy'];
    } : {
        orderBy?: BatchGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, BatchGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBatchGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Batch model
     */
    readonly fields: BatchFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for Batch.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__BatchClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    manufacturer<T extends Prisma.ManufacturerDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ManufacturerDefaultArgs<ExtArgs>>): Prisma.Prisma__ManufacturerClient<runtime.Types.Result.GetResult<Prisma.$ManufacturerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    medicine<T extends Prisma.MedicineDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.MedicineDefaultArgs<ExtArgs>>): Prisma.Prisma__MedicineClient<runtime.Types.Result.GetResult<Prisma.$MedicinePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    qrCodes<T extends Prisma.Batch$qrCodesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Batch$qrCodesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$QRCodePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    scanLogs<T extends Prisma.Batch$scanLogsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Batch$scanLogsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ScanLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
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
 * Fields of the Batch model
 */
export interface BatchFieldRefs {
    readonly id: Prisma.FieldRef<"Batch", 'String'>;
    readonly batchHash: Prisma.FieldRef<"Batch", 'String'>;
    readonly manufacturingDate: Prisma.FieldRef<"Batch", 'DateTime'>;
    readonly expiryDate: Prisma.FieldRef<"Batch", 'DateTime'>;
    readonly status: Prisma.FieldRef<"Batch", 'BatchStatus'>;
    readonly createdAt: Prisma.FieldRef<"Batch", 'DateTime'>;
    readonly blockchainTxHash: Prisma.FieldRef<"Batch", 'String'>;
    readonly blockchainPda: Prisma.FieldRef<"Batch", 'String'>;
    readonly batchNumber: Prisma.FieldRef<"Batch", 'String'>;
    readonly manufacturerId: Prisma.FieldRef<"Batch", 'String'>;
    readonly medicineId: Prisma.FieldRef<"Batch", 'String'>;
    readonly quantity: Prisma.FieldRef<"Batch", 'Int'>;
    readonly invoiceNumber: Prisma.FieldRef<"Batch", 'String'>;
    readonly invoiceDate: Prisma.FieldRef<"Batch", 'DateTime'>;
    readonly gstNumber: Prisma.FieldRef<"Batch", 'String'>;
    readonly warehouseLocation: Prisma.FieldRef<"Batch", 'String'>;
    readonly warehouseAddress: Prisma.FieldRef<"Batch", 'String'>;
    readonly lifecycleStatus: Prisma.FieldRef<"Batch", 'LifecycleStatus'>;
    readonly updatedAt: Prisma.FieldRef<"Batch", 'DateTime'>;
}
/**
 * Batch findUnique
 */
export type BatchFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Batch
     */
    select?: Prisma.BatchSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Batch
     */
    omit?: Prisma.BatchOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.BatchInclude<ExtArgs> | null;
    /**
     * Filter, which Batch to fetch.
     */
    where: Prisma.BatchWhereUniqueInput;
};
/**
 * Batch findUniqueOrThrow
 */
export type BatchFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Batch
     */
    select?: Prisma.BatchSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Batch
     */
    omit?: Prisma.BatchOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.BatchInclude<ExtArgs> | null;
    /**
     * Filter, which Batch to fetch.
     */
    where: Prisma.BatchWhereUniqueInput;
};
/**
 * Batch findFirst
 */
export type BatchFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Batch
     */
    select?: Prisma.BatchSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Batch
     */
    omit?: Prisma.BatchOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.BatchInclude<ExtArgs> | null;
    /**
     * Filter, which Batch to fetch.
     */
    where?: Prisma.BatchWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Batches to fetch.
     */
    orderBy?: Prisma.BatchOrderByWithRelationInput | Prisma.BatchOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Batches.
     */
    cursor?: Prisma.BatchWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Batches from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Batches.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Batches.
     */
    distinct?: Prisma.BatchScalarFieldEnum | Prisma.BatchScalarFieldEnum[];
};
/**
 * Batch findFirstOrThrow
 */
export type BatchFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Batch
     */
    select?: Prisma.BatchSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Batch
     */
    omit?: Prisma.BatchOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.BatchInclude<ExtArgs> | null;
    /**
     * Filter, which Batch to fetch.
     */
    where?: Prisma.BatchWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Batches to fetch.
     */
    orderBy?: Prisma.BatchOrderByWithRelationInput | Prisma.BatchOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Batches.
     */
    cursor?: Prisma.BatchWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Batches from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Batches.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Batches.
     */
    distinct?: Prisma.BatchScalarFieldEnum | Prisma.BatchScalarFieldEnum[];
};
/**
 * Batch findMany
 */
export type BatchFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Batch
     */
    select?: Prisma.BatchSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Batch
     */
    omit?: Prisma.BatchOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.BatchInclude<ExtArgs> | null;
    /**
     * Filter, which Batches to fetch.
     */
    where?: Prisma.BatchWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Batches to fetch.
     */
    orderBy?: Prisma.BatchOrderByWithRelationInput | Prisma.BatchOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Batches.
     */
    cursor?: Prisma.BatchWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Batches from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Batches.
     */
    skip?: number;
    distinct?: Prisma.BatchScalarFieldEnum | Prisma.BatchScalarFieldEnum[];
};
/**
 * Batch create
 */
export type BatchCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Batch
     */
    select?: Prisma.BatchSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Batch
     */
    omit?: Prisma.BatchOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.BatchInclude<ExtArgs> | null;
    /**
     * The data needed to create a Batch.
     */
    data: Prisma.XOR<Prisma.BatchCreateInput, Prisma.BatchUncheckedCreateInput>;
};
/**
 * Batch createMany
 */
export type BatchCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many Batches.
     */
    data: Prisma.BatchCreateManyInput | Prisma.BatchCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * Batch createManyAndReturn
 */
export type BatchCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Batch
     */
    select?: Prisma.BatchSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Batch
     */
    omit?: Prisma.BatchOmit<ExtArgs> | null;
    /**
     * The data used to create many Batches.
     */
    data: Prisma.BatchCreateManyInput | Prisma.BatchCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.BatchIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * Batch update
 */
export type BatchUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Batch
     */
    select?: Prisma.BatchSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Batch
     */
    omit?: Prisma.BatchOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.BatchInclude<ExtArgs> | null;
    /**
     * The data needed to update a Batch.
     */
    data: Prisma.XOR<Prisma.BatchUpdateInput, Prisma.BatchUncheckedUpdateInput>;
    /**
     * Choose, which Batch to update.
     */
    where: Prisma.BatchWhereUniqueInput;
};
/**
 * Batch updateMany
 */
export type BatchUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update Batches.
     */
    data: Prisma.XOR<Prisma.BatchUpdateManyMutationInput, Prisma.BatchUncheckedUpdateManyInput>;
    /**
     * Filter which Batches to update
     */
    where?: Prisma.BatchWhereInput;
    /**
     * Limit how many Batches to update.
     */
    limit?: number;
};
/**
 * Batch updateManyAndReturn
 */
export type BatchUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Batch
     */
    select?: Prisma.BatchSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Batch
     */
    omit?: Prisma.BatchOmit<ExtArgs> | null;
    /**
     * The data used to update Batches.
     */
    data: Prisma.XOR<Prisma.BatchUpdateManyMutationInput, Prisma.BatchUncheckedUpdateManyInput>;
    /**
     * Filter which Batches to update
     */
    where?: Prisma.BatchWhereInput;
    /**
     * Limit how many Batches to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.BatchIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * Batch upsert
 */
export type BatchUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Batch
     */
    select?: Prisma.BatchSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Batch
     */
    omit?: Prisma.BatchOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.BatchInclude<ExtArgs> | null;
    /**
     * The filter to search for the Batch to update in case it exists.
     */
    where: Prisma.BatchWhereUniqueInput;
    /**
     * In case the Batch found by the `where` argument doesn't exist, create a new Batch with this data.
     */
    create: Prisma.XOR<Prisma.BatchCreateInput, Prisma.BatchUncheckedCreateInput>;
    /**
     * In case the Batch was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.BatchUpdateInput, Prisma.BatchUncheckedUpdateInput>;
};
/**
 * Batch delete
 */
export type BatchDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Batch
     */
    select?: Prisma.BatchSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Batch
     */
    omit?: Prisma.BatchOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.BatchInclude<ExtArgs> | null;
    /**
     * Filter which Batch to delete.
     */
    where: Prisma.BatchWhereUniqueInput;
};
/**
 * Batch deleteMany
 */
export type BatchDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Batches to delete
     */
    where?: Prisma.BatchWhereInput;
    /**
     * Limit how many Batches to delete.
     */
    limit?: number;
};
/**
 * Batch.qrCodes
 */
export type Batch$qrCodesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    where?: Prisma.QRCodeWhereInput;
    orderBy?: Prisma.QRCodeOrderByWithRelationInput | Prisma.QRCodeOrderByWithRelationInput[];
    cursor?: Prisma.QRCodeWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.QRCodeScalarFieldEnum | Prisma.QRCodeScalarFieldEnum[];
};
/**
 * Batch.scanLogs
 */
export type Batch$scanLogsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
 * Batch without action
 */
export type BatchDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Batch
     */
    select?: Prisma.BatchSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Batch
     */
    omit?: Prisma.BatchOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.BatchInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=Batch.d.ts.map