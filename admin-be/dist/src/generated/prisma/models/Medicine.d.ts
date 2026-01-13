/**
 * This file exports the `Medicine` model and its related types.
 *
 * 🟢 You can import this file directly.
 */
import * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model Medicine
 *
 */
export type MedicineModel = runtime.Types.Result.DefaultSelection<Prisma.$MedicinePayload>;
export type AggregateMedicine = {
    _count: MedicineCountAggregateOutputType | null;
    _avg: MedicineAvgAggregateOutputType | null;
    _sum: MedicineSumAggregateOutputType | null;
    _min: MedicineMinAggregateOutputType | null;
    _max: MedicineMaxAggregateOutputType | null;
};
export type MedicineAvgAggregateOutputType = {
    mrp: runtime.Decimal | null;
};
export type MedicineSumAggregateOutputType = {
    mrp: runtime.Decimal | null;
};
export type MedicineMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    genericName: string | null;
    strength: string | null;
    composition: string | null;
    dosageForm: string | null;
    mrp: runtime.Decimal | null;
    storageCondition: string | null;
    imageUrl: string | null;
    description: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type MedicineMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    genericName: string | null;
    strength: string | null;
    composition: string | null;
    dosageForm: string | null;
    mrp: runtime.Decimal | null;
    storageCondition: string | null;
    imageUrl: string | null;
    description: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type MedicineCountAggregateOutputType = {
    id: number;
    name: number;
    genericName: number;
    strength: number;
    composition: number;
    dosageForm: number;
    mrp: number;
    storageCondition: number;
    imageUrl: number;
    description: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type MedicineAvgAggregateInputType = {
    mrp?: true;
};
export type MedicineSumAggregateInputType = {
    mrp?: true;
};
export type MedicineMinAggregateInputType = {
    id?: true;
    name?: true;
    genericName?: true;
    strength?: true;
    composition?: true;
    dosageForm?: true;
    mrp?: true;
    storageCondition?: true;
    imageUrl?: true;
    description?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type MedicineMaxAggregateInputType = {
    id?: true;
    name?: true;
    genericName?: true;
    strength?: true;
    composition?: true;
    dosageForm?: true;
    mrp?: true;
    storageCondition?: true;
    imageUrl?: true;
    description?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type MedicineCountAggregateInputType = {
    id?: true;
    name?: true;
    genericName?: true;
    strength?: true;
    composition?: true;
    dosageForm?: true;
    mrp?: true;
    storageCondition?: true;
    imageUrl?: true;
    description?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type MedicineAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Medicine to aggregate.
     */
    where?: Prisma.MedicineWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Medicines to fetch.
     */
    orderBy?: Prisma.MedicineOrderByWithRelationInput | Prisma.MedicineOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.MedicineWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Medicines from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Medicines.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Medicines
    **/
    _count?: true | MedicineCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: MedicineAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: MedicineSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: MedicineMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: MedicineMaxAggregateInputType;
};
export type GetMedicineAggregateType<T extends MedicineAggregateArgs> = {
    [P in keyof T & keyof AggregateMedicine]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateMedicine[P]> : Prisma.GetScalarType<T[P], AggregateMedicine[P]>;
};
export type MedicineGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MedicineWhereInput;
    orderBy?: Prisma.MedicineOrderByWithAggregationInput | Prisma.MedicineOrderByWithAggregationInput[];
    by: Prisma.MedicineScalarFieldEnum[] | Prisma.MedicineScalarFieldEnum;
    having?: Prisma.MedicineScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: MedicineCountAggregateInputType | true;
    _avg?: MedicineAvgAggregateInputType;
    _sum?: MedicineSumAggregateInputType;
    _min?: MedicineMinAggregateInputType;
    _max?: MedicineMaxAggregateInputType;
};
export type MedicineGroupByOutputType = {
    id: string;
    name: string;
    genericName: string | null;
    strength: string;
    composition: string;
    dosageForm: string;
    mrp: runtime.Decimal;
    storageCondition: string | null;
    imageUrl: string | null;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: MedicineCountAggregateOutputType | null;
    _avg: MedicineAvgAggregateOutputType | null;
    _sum: MedicineSumAggregateOutputType | null;
    _min: MedicineMinAggregateOutputType | null;
    _max: MedicineMaxAggregateOutputType | null;
};
type GetMedicineGroupByPayload<T extends MedicineGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<MedicineGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof MedicineGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], MedicineGroupByOutputType[P]> : Prisma.GetScalarType<T[P], MedicineGroupByOutputType[P]>;
}>>;
export type MedicineWhereInput = {
    AND?: Prisma.MedicineWhereInput | Prisma.MedicineWhereInput[];
    OR?: Prisma.MedicineWhereInput[];
    NOT?: Prisma.MedicineWhereInput | Prisma.MedicineWhereInput[];
    id?: Prisma.StringFilter<"Medicine"> | string;
    name?: Prisma.StringFilter<"Medicine"> | string;
    genericName?: Prisma.StringNullableFilter<"Medicine"> | string | null;
    strength?: Prisma.StringFilter<"Medicine"> | string;
    composition?: Prisma.StringFilter<"Medicine"> | string;
    dosageForm?: Prisma.StringFilter<"Medicine"> | string;
    mrp?: Prisma.DecimalFilter<"Medicine"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    storageCondition?: Prisma.StringNullableFilter<"Medicine"> | string | null;
    imageUrl?: Prisma.StringNullableFilter<"Medicine"> | string | null;
    description?: Prisma.StringNullableFilter<"Medicine"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Medicine"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Medicine"> | Date | string;
    batches?: Prisma.BatchListRelationFilter;
};
export type MedicineOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    genericName?: Prisma.SortOrderInput | Prisma.SortOrder;
    strength?: Prisma.SortOrder;
    composition?: Prisma.SortOrder;
    dosageForm?: Prisma.SortOrder;
    mrp?: Prisma.SortOrder;
    storageCondition?: Prisma.SortOrderInput | Prisma.SortOrder;
    imageUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    batches?: Prisma.BatchOrderByRelationAggregateInput;
};
export type MedicineWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.MedicineWhereInput | Prisma.MedicineWhereInput[];
    OR?: Prisma.MedicineWhereInput[];
    NOT?: Prisma.MedicineWhereInput | Prisma.MedicineWhereInput[];
    name?: Prisma.StringFilter<"Medicine"> | string;
    genericName?: Prisma.StringNullableFilter<"Medicine"> | string | null;
    strength?: Prisma.StringFilter<"Medicine"> | string;
    composition?: Prisma.StringFilter<"Medicine"> | string;
    dosageForm?: Prisma.StringFilter<"Medicine"> | string;
    mrp?: Prisma.DecimalFilter<"Medicine"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    storageCondition?: Prisma.StringNullableFilter<"Medicine"> | string | null;
    imageUrl?: Prisma.StringNullableFilter<"Medicine"> | string | null;
    description?: Prisma.StringNullableFilter<"Medicine"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Medicine"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Medicine"> | Date | string;
    batches?: Prisma.BatchListRelationFilter;
}, "id">;
export type MedicineOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    genericName?: Prisma.SortOrderInput | Prisma.SortOrder;
    strength?: Prisma.SortOrder;
    composition?: Prisma.SortOrder;
    dosageForm?: Prisma.SortOrder;
    mrp?: Prisma.SortOrder;
    storageCondition?: Prisma.SortOrderInput | Prisma.SortOrder;
    imageUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.MedicineCountOrderByAggregateInput;
    _avg?: Prisma.MedicineAvgOrderByAggregateInput;
    _max?: Prisma.MedicineMaxOrderByAggregateInput;
    _min?: Prisma.MedicineMinOrderByAggregateInput;
    _sum?: Prisma.MedicineSumOrderByAggregateInput;
};
export type MedicineScalarWhereWithAggregatesInput = {
    AND?: Prisma.MedicineScalarWhereWithAggregatesInput | Prisma.MedicineScalarWhereWithAggregatesInput[];
    OR?: Prisma.MedicineScalarWhereWithAggregatesInput[];
    NOT?: Prisma.MedicineScalarWhereWithAggregatesInput | Prisma.MedicineScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Medicine"> | string;
    name?: Prisma.StringWithAggregatesFilter<"Medicine"> | string;
    genericName?: Prisma.StringNullableWithAggregatesFilter<"Medicine"> | string | null;
    strength?: Prisma.StringWithAggregatesFilter<"Medicine"> | string;
    composition?: Prisma.StringWithAggregatesFilter<"Medicine"> | string;
    dosageForm?: Prisma.StringWithAggregatesFilter<"Medicine"> | string;
    mrp?: Prisma.DecimalWithAggregatesFilter<"Medicine"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    storageCondition?: Prisma.StringNullableWithAggregatesFilter<"Medicine"> | string | null;
    imageUrl?: Prisma.StringNullableWithAggregatesFilter<"Medicine"> | string | null;
    description?: Prisma.StringNullableWithAggregatesFilter<"Medicine"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Medicine"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Medicine"> | Date | string;
};
export type MedicineCreateInput = {
    id?: string;
    name: string;
    genericName?: string | null;
    strength: string;
    composition: string;
    dosageForm: string;
    mrp: runtime.Decimal | runtime.DecimalJsLike | number | string;
    storageCondition?: string | null;
    imageUrl?: string | null;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    batches?: Prisma.BatchCreateNestedManyWithoutMedicineInput;
};
export type MedicineUncheckedCreateInput = {
    id?: string;
    name: string;
    genericName?: string | null;
    strength: string;
    composition: string;
    dosageForm: string;
    mrp: runtime.Decimal | runtime.DecimalJsLike | number | string;
    storageCondition?: string | null;
    imageUrl?: string | null;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    batches?: Prisma.BatchUncheckedCreateNestedManyWithoutMedicineInput;
};
export type MedicineUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    genericName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    strength?: Prisma.StringFieldUpdateOperationsInput | string;
    composition?: Prisma.StringFieldUpdateOperationsInput | string;
    dosageForm?: Prisma.StringFieldUpdateOperationsInput | string;
    mrp?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    storageCondition?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    imageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    batches?: Prisma.BatchUpdateManyWithoutMedicineNestedInput;
};
export type MedicineUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    genericName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    strength?: Prisma.StringFieldUpdateOperationsInput | string;
    composition?: Prisma.StringFieldUpdateOperationsInput | string;
    dosageForm?: Prisma.StringFieldUpdateOperationsInput | string;
    mrp?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    storageCondition?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    imageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    batches?: Prisma.BatchUncheckedUpdateManyWithoutMedicineNestedInput;
};
export type MedicineCreateManyInput = {
    id?: string;
    name: string;
    genericName?: string | null;
    strength: string;
    composition: string;
    dosageForm: string;
    mrp: runtime.Decimal | runtime.DecimalJsLike | number | string;
    storageCondition?: string | null;
    imageUrl?: string | null;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type MedicineUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    genericName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    strength?: Prisma.StringFieldUpdateOperationsInput | string;
    composition?: Prisma.StringFieldUpdateOperationsInput | string;
    dosageForm?: Prisma.StringFieldUpdateOperationsInput | string;
    mrp?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    storageCondition?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    imageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MedicineUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    genericName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    strength?: Prisma.StringFieldUpdateOperationsInput | string;
    composition?: Prisma.StringFieldUpdateOperationsInput | string;
    dosageForm?: Prisma.StringFieldUpdateOperationsInput | string;
    mrp?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    storageCondition?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    imageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MedicineCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    genericName?: Prisma.SortOrder;
    strength?: Prisma.SortOrder;
    composition?: Prisma.SortOrder;
    dosageForm?: Prisma.SortOrder;
    mrp?: Prisma.SortOrder;
    storageCondition?: Prisma.SortOrder;
    imageUrl?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type MedicineAvgOrderByAggregateInput = {
    mrp?: Prisma.SortOrder;
};
export type MedicineMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    genericName?: Prisma.SortOrder;
    strength?: Prisma.SortOrder;
    composition?: Prisma.SortOrder;
    dosageForm?: Prisma.SortOrder;
    mrp?: Prisma.SortOrder;
    storageCondition?: Prisma.SortOrder;
    imageUrl?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type MedicineMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    genericName?: Prisma.SortOrder;
    strength?: Prisma.SortOrder;
    composition?: Prisma.SortOrder;
    dosageForm?: Prisma.SortOrder;
    mrp?: Prisma.SortOrder;
    storageCondition?: Prisma.SortOrder;
    imageUrl?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type MedicineSumOrderByAggregateInput = {
    mrp?: Prisma.SortOrder;
};
export type MedicineScalarRelationFilter = {
    is?: Prisma.MedicineWhereInput;
    isNot?: Prisma.MedicineWhereInput;
};
export type DecimalFieldUpdateOperationsInput = {
    set?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    increment?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    decrement?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    multiply?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    divide?: runtime.Decimal | runtime.DecimalJsLike | number | string;
};
export type MedicineCreateNestedOneWithoutBatchesInput = {
    create?: Prisma.XOR<Prisma.MedicineCreateWithoutBatchesInput, Prisma.MedicineUncheckedCreateWithoutBatchesInput>;
    connectOrCreate?: Prisma.MedicineCreateOrConnectWithoutBatchesInput;
    connect?: Prisma.MedicineWhereUniqueInput;
};
export type MedicineUpdateOneRequiredWithoutBatchesNestedInput = {
    create?: Prisma.XOR<Prisma.MedicineCreateWithoutBatchesInput, Prisma.MedicineUncheckedCreateWithoutBatchesInput>;
    connectOrCreate?: Prisma.MedicineCreateOrConnectWithoutBatchesInput;
    upsert?: Prisma.MedicineUpsertWithoutBatchesInput;
    connect?: Prisma.MedicineWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.MedicineUpdateToOneWithWhereWithoutBatchesInput, Prisma.MedicineUpdateWithoutBatchesInput>, Prisma.MedicineUncheckedUpdateWithoutBatchesInput>;
};
export type MedicineCreateWithoutBatchesInput = {
    id?: string;
    name: string;
    genericName?: string | null;
    strength: string;
    composition: string;
    dosageForm: string;
    mrp: runtime.Decimal | runtime.DecimalJsLike | number | string;
    storageCondition?: string | null;
    imageUrl?: string | null;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type MedicineUncheckedCreateWithoutBatchesInput = {
    id?: string;
    name: string;
    genericName?: string | null;
    strength: string;
    composition: string;
    dosageForm: string;
    mrp: runtime.Decimal | runtime.DecimalJsLike | number | string;
    storageCondition?: string | null;
    imageUrl?: string | null;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type MedicineCreateOrConnectWithoutBatchesInput = {
    where: Prisma.MedicineWhereUniqueInput;
    create: Prisma.XOR<Prisma.MedicineCreateWithoutBatchesInput, Prisma.MedicineUncheckedCreateWithoutBatchesInput>;
};
export type MedicineUpsertWithoutBatchesInput = {
    update: Prisma.XOR<Prisma.MedicineUpdateWithoutBatchesInput, Prisma.MedicineUncheckedUpdateWithoutBatchesInput>;
    create: Prisma.XOR<Prisma.MedicineCreateWithoutBatchesInput, Prisma.MedicineUncheckedCreateWithoutBatchesInput>;
    where?: Prisma.MedicineWhereInput;
};
export type MedicineUpdateToOneWithWhereWithoutBatchesInput = {
    where?: Prisma.MedicineWhereInput;
    data: Prisma.XOR<Prisma.MedicineUpdateWithoutBatchesInput, Prisma.MedicineUncheckedUpdateWithoutBatchesInput>;
};
export type MedicineUpdateWithoutBatchesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    genericName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    strength?: Prisma.StringFieldUpdateOperationsInput | string;
    composition?: Prisma.StringFieldUpdateOperationsInput | string;
    dosageForm?: Prisma.StringFieldUpdateOperationsInput | string;
    mrp?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    storageCondition?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    imageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MedicineUncheckedUpdateWithoutBatchesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    genericName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    strength?: Prisma.StringFieldUpdateOperationsInput | string;
    composition?: Prisma.StringFieldUpdateOperationsInput | string;
    dosageForm?: Prisma.StringFieldUpdateOperationsInput | string;
    mrp?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    storageCondition?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    imageUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
/**
 * Count Type MedicineCountOutputType
 */
export type MedicineCountOutputType = {
    batches: number;
};
export type MedicineCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    batches?: boolean | MedicineCountOutputTypeCountBatchesArgs;
};
/**
 * MedicineCountOutputType without action
 */
export type MedicineCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MedicineCountOutputType
     */
    select?: Prisma.MedicineCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * MedicineCountOutputType without action
 */
export type MedicineCountOutputTypeCountBatchesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.BatchWhereInput;
};
export type MedicineSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    genericName?: boolean;
    strength?: boolean;
    composition?: boolean;
    dosageForm?: boolean;
    mrp?: boolean;
    storageCondition?: boolean;
    imageUrl?: boolean;
    description?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    batches?: boolean | Prisma.Medicine$batchesArgs<ExtArgs>;
    _count?: boolean | Prisma.MedicineCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["medicine"]>;
export type MedicineSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    genericName?: boolean;
    strength?: boolean;
    composition?: boolean;
    dosageForm?: boolean;
    mrp?: boolean;
    storageCondition?: boolean;
    imageUrl?: boolean;
    description?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["medicine"]>;
export type MedicineSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    genericName?: boolean;
    strength?: boolean;
    composition?: boolean;
    dosageForm?: boolean;
    mrp?: boolean;
    storageCondition?: boolean;
    imageUrl?: boolean;
    description?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["medicine"]>;
export type MedicineSelectScalar = {
    id?: boolean;
    name?: boolean;
    genericName?: boolean;
    strength?: boolean;
    composition?: boolean;
    dosageForm?: boolean;
    mrp?: boolean;
    storageCondition?: boolean;
    imageUrl?: boolean;
    description?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type MedicineOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "genericName" | "strength" | "composition" | "dosageForm" | "mrp" | "storageCondition" | "imageUrl" | "description" | "createdAt" | "updatedAt", ExtArgs["result"]["medicine"]>;
export type MedicineInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    batches?: boolean | Prisma.Medicine$batchesArgs<ExtArgs>;
    _count?: boolean | Prisma.MedicineCountOutputTypeDefaultArgs<ExtArgs>;
};
export type MedicineIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type MedicineIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $MedicinePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Medicine";
    objects: {
        batches: Prisma.$BatchPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        genericName: string | null;
        strength: string;
        composition: string;
        dosageForm: string;
        mrp: runtime.Decimal;
        storageCondition: string | null;
        imageUrl: string | null;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["medicine"]>;
    composites: {};
};
export type MedicineGetPayload<S extends boolean | null | undefined | MedicineDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$MedicinePayload, S>;
export type MedicineCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<MedicineFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: MedicineCountAggregateInputType | true;
};
export interface MedicineDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Medicine'];
        meta: {
            name: 'Medicine';
        };
    };
    /**
     * Find zero or one Medicine that matches the filter.
     * @param {MedicineFindUniqueArgs} args - Arguments to find a Medicine
     * @example
     * // Get one Medicine
     * const medicine = await prisma.medicine.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MedicineFindUniqueArgs>(args: Prisma.SelectSubset<T, MedicineFindUniqueArgs<ExtArgs>>): Prisma.Prisma__MedicineClient<runtime.Types.Result.GetResult<Prisma.$MedicinePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one Medicine that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MedicineFindUniqueOrThrowArgs} args - Arguments to find a Medicine
     * @example
     * // Get one Medicine
     * const medicine = await prisma.medicine.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MedicineFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, MedicineFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__MedicineClient<runtime.Types.Result.GetResult<Prisma.$MedicinePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Medicine that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MedicineFindFirstArgs} args - Arguments to find a Medicine
     * @example
     * // Get one Medicine
     * const medicine = await prisma.medicine.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MedicineFindFirstArgs>(args?: Prisma.SelectSubset<T, MedicineFindFirstArgs<ExtArgs>>): Prisma.Prisma__MedicineClient<runtime.Types.Result.GetResult<Prisma.$MedicinePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Medicine that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MedicineFindFirstOrThrowArgs} args - Arguments to find a Medicine
     * @example
     * // Get one Medicine
     * const medicine = await prisma.medicine.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MedicineFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, MedicineFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__MedicineClient<runtime.Types.Result.GetResult<Prisma.$MedicinePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more Medicines that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MedicineFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Medicines
     * const medicines = await prisma.medicine.findMany()
     *
     * // Get first 10 Medicines
     * const medicines = await prisma.medicine.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const medicineWithIdOnly = await prisma.medicine.findMany({ select: { id: true } })
     *
     */
    findMany<T extends MedicineFindManyArgs>(args?: Prisma.SelectSubset<T, MedicineFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MedicinePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a Medicine.
     * @param {MedicineCreateArgs} args - Arguments to create a Medicine.
     * @example
     * // Create one Medicine
     * const Medicine = await prisma.medicine.create({
     *   data: {
     *     // ... data to create a Medicine
     *   }
     * })
     *
     */
    create<T extends MedicineCreateArgs>(args: Prisma.SelectSubset<T, MedicineCreateArgs<ExtArgs>>): Prisma.Prisma__MedicineClient<runtime.Types.Result.GetResult<Prisma.$MedicinePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many Medicines.
     * @param {MedicineCreateManyArgs} args - Arguments to create many Medicines.
     * @example
     * // Create many Medicines
     * const medicine = await prisma.medicine.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends MedicineCreateManyArgs>(args?: Prisma.SelectSubset<T, MedicineCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many Medicines and returns the data saved in the database.
     * @param {MedicineCreateManyAndReturnArgs} args - Arguments to create many Medicines.
     * @example
     * // Create many Medicines
     * const medicine = await prisma.medicine.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Medicines and only return the `id`
     * const medicineWithIdOnly = await prisma.medicine.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends MedicineCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, MedicineCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MedicinePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a Medicine.
     * @param {MedicineDeleteArgs} args - Arguments to delete one Medicine.
     * @example
     * // Delete one Medicine
     * const Medicine = await prisma.medicine.delete({
     *   where: {
     *     // ... filter to delete one Medicine
     *   }
     * })
     *
     */
    delete<T extends MedicineDeleteArgs>(args: Prisma.SelectSubset<T, MedicineDeleteArgs<ExtArgs>>): Prisma.Prisma__MedicineClient<runtime.Types.Result.GetResult<Prisma.$MedicinePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one Medicine.
     * @param {MedicineUpdateArgs} args - Arguments to update one Medicine.
     * @example
     * // Update one Medicine
     * const medicine = await prisma.medicine.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends MedicineUpdateArgs>(args: Prisma.SelectSubset<T, MedicineUpdateArgs<ExtArgs>>): Prisma.Prisma__MedicineClient<runtime.Types.Result.GetResult<Prisma.$MedicinePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more Medicines.
     * @param {MedicineDeleteManyArgs} args - Arguments to filter Medicines to delete.
     * @example
     * // Delete a few Medicines
     * const { count } = await prisma.medicine.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends MedicineDeleteManyArgs>(args?: Prisma.SelectSubset<T, MedicineDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Medicines.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MedicineUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Medicines
     * const medicine = await prisma.medicine.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends MedicineUpdateManyArgs>(args: Prisma.SelectSubset<T, MedicineUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Medicines and returns the data updated in the database.
     * @param {MedicineUpdateManyAndReturnArgs} args - Arguments to update many Medicines.
     * @example
     * // Update many Medicines
     * const medicine = await prisma.medicine.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Medicines and only return the `id`
     * const medicineWithIdOnly = await prisma.medicine.updateManyAndReturn({
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
    updateManyAndReturn<T extends MedicineUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, MedicineUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MedicinePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one Medicine.
     * @param {MedicineUpsertArgs} args - Arguments to update or create a Medicine.
     * @example
     * // Update or create a Medicine
     * const medicine = await prisma.medicine.upsert({
     *   create: {
     *     // ... data to create a Medicine
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Medicine we want to update
     *   }
     * })
     */
    upsert<T extends MedicineUpsertArgs>(args: Prisma.SelectSubset<T, MedicineUpsertArgs<ExtArgs>>): Prisma.Prisma__MedicineClient<runtime.Types.Result.GetResult<Prisma.$MedicinePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of Medicines.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MedicineCountArgs} args - Arguments to filter Medicines to count.
     * @example
     * // Count the number of Medicines
     * const count = await prisma.medicine.count({
     *   where: {
     *     // ... the filter for the Medicines we want to count
     *   }
     * })
    **/
    count<T extends MedicineCountArgs>(args?: Prisma.Subset<T, MedicineCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], MedicineCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a Medicine.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MedicineAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends MedicineAggregateArgs>(args: Prisma.Subset<T, MedicineAggregateArgs>): Prisma.PrismaPromise<GetMedicineAggregateType<T>>;
    /**
     * Group by Medicine.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MedicineGroupByArgs} args - Group by arguments.
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
    groupBy<T extends MedicineGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: MedicineGroupByArgs['orderBy'];
    } : {
        orderBy?: MedicineGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, MedicineGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMedicineGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Medicine model
     */
    readonly fields: MedicineFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for Medicine.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__MedicineClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    batches<T extends Prisma.Medicine$batchesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Medicine$batchesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BatchPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
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
 * Fields of the Medicine model
 */
export interface MedicineFieldRefs {
    readonly id: Prisma.FieldRef<"Medicine", 'String'>;
    readonly name: Prisma.FieldRef<"Medicine", 'String'>;
    readonly genericName: Prisma.FieldRef<"Medicine", 'String'>;
    readonly strength: Prisma.FieldRef<"Medicine", 'String'>;
    readonly composition: Prisma.FieldRef<"Medicine", 'String'>;
    readonly dosageForm: Prisma.FieldRef<"Medicine", 'String'>;
    readonly mrp: Prisma.FieldRef<"Medicine", 'Decimal'>;
    readonly storageCondition: Prisma.FieldRef<"Medicine", 'String'>;
    readonly imageUrl: Prisma.FieldRef<"Medicine", 'String'>;
    readonly description: Prisma.FieldRef<"Medicine", 'String'>;
    readonly createdAt: Prisma.FieldRef<"Medicine", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Medicine", 'DateTime'>;
}
/**
 * Medicine findUnique
 */
export type MedicineFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Medicine
     */
    select?: Prisma.MedicineSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Medicine
     */
    omit?: Prisma.MedicineOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MedicineInclude<ExtArgs> | null;
    /**
     * Filter, which Medicine to fetch.
     */
    where: Prisma.MedicineWhereUniqueInput;
};
/**
 * Medicine findUniqueOrThrow
 */
export type MedicineFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Medicine
     */
    select?: Prisma.MedicineSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Medicine
     */
    omit?: Prisma.MedicineOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MedicineInclude<ExtArgs> | null;
    /**
     * Filter, which Medicine to fetch.
     */
    where: Prisma.MedicineWhereUniqueInput;
};
/**
 * Medicine findFirst
 */
export type MedicineFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Medicine
     */
    select?: Prisma.MedicineSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Medicine
     */
    omit?: Prisma.MedicineOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MedicineInclude<ExtArgs> | null;
    /**
     * Filter, which Medicine to fetch.
     */
    where?: Prisma.MedicineWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Medicines to fetch.
     */
    orderBy?: Prisma.MedicineOrderByWithRelationInput | Prisma.MedicineOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Medicines.
     */
    cursor?: Prisma.MedicineWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Medicines from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Medicines.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Medicines.
     */
    distinct?: Prisma.MedicineScalarFieldEnum | Prisma.MedicineScalarFieldEnum[];
};
/**
 * Medicine findFirstOrThrow
 */
export type MedicineFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Medicine
     */
    select?: Prisma.MedicineSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Medicine
     */
    omit?: Prisma.MedicineOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MedicineInclude<ExtArgs> | null;
    /**
     * Filter, which Medicine to fetch.
     */
    where?: Prisma.MedicineWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Medicines to fetch.
     */
    orderBy?: Prisma.MedicineOrderByWithRelationInput | Prisma.MedicineOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Medicines.
     */
    cursor?: Prisma.MedicineWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Medicines from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Medicines.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Medicines.
     */
    distinct?: Prisma.MedicineScalarFieldEnum | Prisma.MedicineScalarFieldEnum[];
};
/**
 * Medicine findMany
 */
export type MedicineFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Medicine
     */
    select?: Prisma.MedicineSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Medicine
     */
    omit?: Prisma.MedicineOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MedicineInclude<ExtArgs> | null;
    /**
     * Filter, which Medicines to fetch.
     */
    where?: Prisma.MedicineWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Medicines to fetch.
     */
    orderBy?: Prisma.MedicineOrderByWithRelationInput | Prisma.MedicineOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Medicines.
     */
    cursor?: Prisma.MedicineWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Medicines from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Medicines.
     */
    skip?: number;
    distinct?: Prisma.MedicineScalarFieldEnum | Prisma.MedicineScalarFieldEnum[];
};
/**
 * Medicine create
 */
export type MedicineCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Medicine
     */
    select?: Prisma.MedicineSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Medicine
     */
    omit?: Prisma.MedicineOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MedicineInclude<ExtArgs> | null;
    /**
     * The data needed to create a Medicine.
     */
    data: Prisma.XOR<Prisma.MedicineCreateInput, Prisma.MedicineUncheckedCreateInput>;
};
/**
 * Medicine createMany
 */
export type MedicineCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many Medicines.
     */
    data: Prisma.MedicineCreateManyInput | Prisma.MedicineCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * Medicine createManyAndReturn
 */
export type MedicineCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Medicine
     */
    select?: Prisma.MedicineSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Medicine
     */
    omit?: Prisma.MedicineOmit<ExtArgs> | null;
    /**
     * The data used to create many Medicines.
     */
    data: Prisma.MedicineCreateManyInput | Prisma.MedicineCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * Medicine update
 */
export type MedicineUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Medicine
     */
    select?: Prisma.MedicineSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Medicine
     */
    omit?: Prisma.MedicineOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MedicineInclude<ExtArgs> | null;
    /**
     * The data needed to update a Medicine.
     */
    data: Prisma.XOR<Prisma.MedicineUpdateInput, Prisma.MedicineUncheckedUpdateInput>;
    /**
     * Choose, which Medicine to update.
     */
    where: Prisma.MedicineWhereUniqueInput;
};
/**
 * Medicine updateMany
 */
export type MedicineUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update Medicines.
     */
    data: Prisma.XOR<Prisma.MedicineUpdateManyMutationInput, Prisma.MedicineUncheckedUpdateManyInput>;
    /**
     * Filter which Medicines to update
     */
    where?: Prisma.MedicineWhereInput;
    /**
     * Limit how many Medicines to update.
     */
    limit?: number;
};
/**
 * Medicine updateManyAndReturn
 */
export type MedicineUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Medicine
     */
    select?: Prisma.MedicineSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Medicine
     */
    omit?: Prisma.MedicineOmit<ExtArgs> | null;
    /**
     * The data used to update Medicines.
     */
    data: Prisma.XOR<Prisma.MedicineUpdateManyMutationInput, Prisma.MedicineUncheckedUpdateManyInput>;
    /**
     * Filter which Medicines to update
     */
    where?: Prisma.MedicineWhereInput;
    /**
     * Limit how many Medicines to update.
     */
    limit?: number;
};
/**
 * Medicine upsert
 */
export type MedicineUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Medicine
     */
    select?: Prisma.MedicineSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Medicine
     */
    omit?: Prisma.MedicineOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MedicineInclude<ExtArgs> | null;
    /**
     * The filter to search for the Medicine to update in case it exists.
     */
    where: Prisma.MedicineWhereUniqueInput;
    /**
     * In case the Medicine found by the `where` argument doesn't exist, create a new Medicine with this data.
     */
    create: Prisma.XOR<Prisma.MedicineCreateInput, Prisma.MedicineUncheckedCreateInput>;
    /**
     * In case the Medicine was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.MedicineUpdateInput, Prisma.MedicineUncheckedUpdateInput>;
};
/**
 * Medicine delete
 */
export type MedicineDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Medicine
     */
    select?: Prisma.MedicineSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Medicine
     */
    omit?: Prisma.MedicineOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MedicineInclude<ExtArgs> | null;
    /**
     * Filter which Medicine to delete.
     */
    where: Prisma.MedicineWhereUniqueInput;
};
/**
 * Medicine deleteMany
 */
export type MedicineDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Medicines to delete
     */
    where?: Prisma.MedicineWhereInput;
    /**
     * Limit how many Medicines to delete.
     */
    limit?: number;
};
/**
 * Medicine.batches
 */
export type Medicine$batchesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    where?: Prisma.BatchWhereInput;
    orderBy?: Prisma.BatchOrderByWithRelationInput | Prisma.BatchOrderByWithRelationInput[];
    cursor?: Prisma.BatchWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.BatchScalarFieldEnum | Prisma.BatchScalarFieldEnum[];
};
/**
 * Medicine without action
 */
export type MedicineDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Medicine
     */
    select?: Prisma.MedicineSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Medicine
     */
    omit?: Prisma.MedicineOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MedicineInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=Medicine.d.ts.map