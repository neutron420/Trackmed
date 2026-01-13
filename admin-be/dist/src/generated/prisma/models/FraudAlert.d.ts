/**
 * This file exports the `FraudAlert` model and its related types.
 *
 * 🟢 You can import this file directly.
 */
import * as runtime from "@prisma/client/runtime/library";
import type * as $Enums from "../enums";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model FraudAlert
 *
 */
export type FraudAlertModel = runtime.Types.Result.DefaultSelection<Prisma.$FraudAlertPayload>;
export type AggregateFraudAlert = {
    _count: FraudAlertCountAggregateOutputType | null;
    _min: FraudAlertMinAggregateOutputType | null;
    _max: FraudAlertMaxAggregateOutputType | null;
};
export type FraudAlertMinAggregateOutputType = {
    id: string | null;
    batchId: string | null;
    qrCodeId: string | null;
    userId: string | null;
    alertType: $Enums.FraudAlertType | null;
    severity: $Enums.FraudSeverity | null;
    description: string | null;
    isResolved: boolean | null;
    resolvedAt: Date | null;
    resolvedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type FraudAlertMaxAggregateOutputType = {
    id: string | null;
    batchId: string | null;
    qrCodeId: string | null;
    userId: string | null;
    alertType: $Enums.FraudAlertType | null;
    severity: $Enums.FraudSeverity | null;
    description: string | null;
    isResolved: boolean | null;
    resolvedAt: Date | null;
    resolvedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type FraudAlertCountAggregateOutputType = {
    id: number;
    batchId: number;
    qrCodeId: number;
    userId: number;
    alertType: number;
    severity: number;
    description: number;
    evidence: number;
    isResolved: number;
    resolvedAt: number;
    resolvedBy: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type FraudAlertMinAggregateInputType = {
    id?: true;
    batchId?: true;
    qrCodeId?: true;
    userId?: true;
    alertType?: true;
    severity?: true;
    description?: true;
    isResolved?: true;
    resolvedAt?: true;
    resolvedBy?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type FraudAlertMaxAggregateInputType = {
    id?: true;
    batchId?: true;
    qrCodeId?: true;
    userId?: true;
    alertType?: true;
    severity?: true;
    description?: true;
    isResolved?: true;
    resolvedAt?: true;
    resolvedBy?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type FraudAlertCountAggregateInputType = {
    id?: true;
    batchId?: true;
    qrCodeId?: true;
    userId?: true;
    alertType?: true;
    severity?: true;
    description?: true;
    evidence?: true;
    isResolved?: true;
    resolvedAt?: true;
    resolvedBy?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type FraudAlertAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which FraudAlert to aggregate.
     */
    where?: Prisma.FraudAlertWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of FraudAlerts to fetch.
     */
    orderBy?: Prisma.FraudAlertOrderByWithRelationInput | Prisma.FraudAlertOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.FraudAlertWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` FraudAlerts from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` FraudAlerts.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned FraudAlerts
    **/
    _count?: true | FraudAlertCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: FraudAlertMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: FraudAlertMaxAggregateInputType;
};
export type GetFraudAlertAggregateType<T extends FraudAlertAggregateArgs> = {
    [P in keyof T & keyof AggregateFraudAlert]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateFraudAlert[P]> : Prisma.GetScalarType<T[P], AggregateFraudAlert[P]>;
};
export type FraudAlertGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.FraudAlertWhereInput;
    orderBy?: Prisma.FraudAlertOrderByWithAggregationInput | Prisma.FraudAlertOrderByWithAggregationInput[];
    by: Prisma.FraudAlertScalarFieldEnum[] | Prisma.FraudAlertScalarFieldEnum;
    having?: Prisma.FraudAlertScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: FraudAlertCountAggregateInputType | true;
    _min?: FraudAlertMinAggregateInputType;
    _max?: FraudAlertMaxAggregateInputType;
};
export type FraudAlertGroupByOutputType = {
    id: string;
    batchId: string | null;
    qrCodeId: string | null;
    userId: string | null;
    alertType: $Enums.FraudAlertType;
    severity: $Enums.FraudSeverity;
    description: string;
    evidence: runtime.JsonValue | null;
    isResolved: boolean;
    resolvedAt: Date | null;
    resolvedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: FraudAlertCountAggregateOutputType | null;
    _min: FraudAlertMinAggregateOutputType | null;
    _max: FraudAlertMaxAggregateOutputType | null;
};
type GetFraudAlertGroupByPayload<T extends FraudAlertGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<FraudAlertGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof FraudAlertGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], FraudAlertGroupByOutputType[P]> : Prisma.GetScalarType<T[P], FraudAlertGroupByOutputType[P]>;
}>>;
export type FraudAlertWhereInput = {
    AND?: Prisma.FraudAlertWhereInput | Prisma.FraudAlertWhereInput[];
    OR?: Prisma.FraudAlertWhereInput[];
    NOT?: Prisma.FraudAlertWhereInput | Prisma.FraudAlertWhereInput[];
    id?: Prisma.StringFilter<"FraudAlert"> | string;
    batchId?: Prisma.StringNullableFilter<"FraudAlert"> | string | null;
    qrCodeId?: Prisma.StringNullableFilter<"FraudAlert"> | string | null;
    userId?: Prisma.StringNullableFilter<"FraudAlert"> | string | null;
    alertType?: Prisma.EnumFraudAlertTypeFilter<"FraudAlert"> | $Enums.FraudAlertType;
    severity?: Prisma.EnumFraudSeverityFilter<"FraudAlert"> | $Enums.FraudSeverity;
    description?: Prisma.StringFilter<"FraudAlert"> | string;
    evidence?: Prisma.JsonNullableFilter<"FraudAlert">;
    isResolved?: Prisma.BoolFilter<"FraudAlert"> | boolean;
    resolvedAt?: Prisma.DateTimeNullableFilter<"FraudAlert"> | Date | string | null;
    resolvedBy?: Prisma.StringNullableFilter<"FraudAlert"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"FraudAlert"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"FraudAlert"> | Date | string;
    user?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
};
export type FraudAlertOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    batchId?: Prisma.SortOrderInput | Prisma.SortOrder;
    qrCodeId?: Prisma.SortOrderInput | Prisma.SortOrder;
    userId?: Prisma.SortOrderInput | Prisma.SortOrder;
    alertType?: Prisma.SortOrder;
    severity?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    evidence?: Prisma.SortOrderInput | Prisma.SortOrder;
    isResolved?: Prisma.SortOrder;
    resolvedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    resolvedBy?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
};
export type FraudAlertWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.FraudAlertWhereInput | Prisma.FraudAlertWhereInput[];
    OR?: Prisma.FraudAlertWhereInput[];
    NOT?: Prisma.FraudAlertWhereInput | Prisma.FraudAlertWhereInput[];
    batchId?: Prisma.StringNullableFilter<"FraudAlert"> | string | null;
    qrCodeId?: Prisma.StringNullableFilter<"FraudAlert"> | string | null;
    userId?: Prisma.StringNullableFilter<"FraudAlert"> | string | null;
    alertType?: Prisma.EnumFraudAlertTypeFilter<"FraudAlert"> | $Enums.FraudAlertType;
    severity?: Prisma.EnumFraudSeverityFilter<"FraudAlert"> | $Enums.FraudSeverity;
    description?: Prisma.StringFilter<"FraudAlert"> | string;
    evidence?: Prisma.JsonNullableFilter<"FraudAlert">;
    isResolved?: Prisma.BoolFilter<"FraudAlert"> | boolean;
    resolvedAt?: Prisma.DateTimeNullableFilter<"FraudAlert"> | Date | string | null;
    resolvedBy?: Prisma.StringNullableFilter<"FraudAlert"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"FraudAlert"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"FraudAlert"> | Date | string;
    user?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
}, "id">;
export type FraudAlertOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    batchId?: Prisma.SortOrderInput | Prisma.SortOrder;
    qrCodeId?: Prisma.SortOrderInput | Prisma.SortOrder;
    userId?: Prisma.SortOrderInput | Prisma.SortOrder;
    alertType?: Prisma.SortOrder;
    severity?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    evidence?: Prisma.SortOrderInput | Prisma.SortOrder;
    isResolved?: Prisma.SortOrder;
    resolvedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    resolvedBy?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.FraudAlertCountOrderByAggregateInput;
    _max?: Prisma.FraudAlertMaxOrderByAggregateInput;
    _min?: Prisma.FraudAlertMinOrderByAggregateInput;
};
export type FraudAlertScalarWhereWithAggregatesInput = {
    AND?: Prisma.FraudAlertScalarWhereWithAggregatesInput | Prisma.FraudAlertScalarWhereWithAggregatesInput[];
    OR?: Prisma.FraudAlertScalarWhereWithAggregatesInput[];
    NOT?: Prisma.FraudAlertScalarWhereWithAggregatesInput | Prisma.FraudAlertScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"FraudAlert"> | string;
    batchId?: Prisma.StringNullableWithAggregatesFilter<"FraudAlert"> | string | null;
    qrCodeId?: Prisma.StringNullableWithAggregatesFilter<"FraudAlert"> | string | null;
    userId?: Prisma.StringNullableWithAggregatesFilter<"FraudAlert"> | string | null;
    alertType?: Prisma.EnumFraudAlertTypeWithAggregatesFilter<"FraudAlert"> | $Enums.FraudAlertType;
    severity?: Prisma.EnumFraudSeverityWithAggregatesFilter<"FraudAlert"> | $Enums.FraudSeverity;
    description?: Prisma.StringWithAggregatesFilter<"FraudAlert"> | string;
    evidence?: Prisma.JsonNullableWithAggregatesFilter<"FraudAlert">;
    isResolved?: Prisma.BoolWithAggregatesFilter<"FraudAlert"> | boolean;
    resolvedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"FraudAlert"> | Date | string | null;
    resolvedBy?: Prisma.StringNullableWithAggregatesFilter<"FraudAlert"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"FraudAlert"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"FraudAlert"> | Date | string;
};
export type FraudAlertCreateInput = {
    id?: string;
    batchId?: string | null;
    qrCodeId?: string | null;
    alertType: $Enums.FraudAlertType;
    severity?: $Enums.FraudSeverity;
    description: string;
    evidence?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    isResolved?: boolean;
    resolvedAt?: Date | string | null;
    resolvedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user?: Prisma.UserCreateNestedOneWithoutFraudAlertsInput;
};
export type FraudAlertUncheckedCreateInput = {
    id?: string;
    batchId?: string | null;
    qrCodeId?: string | null;
    userId?: string | null;
    alertType: $Enums.FraudAlertType;
    severity?: $Enums.FraudSeverity;
    description: string;
    evidence?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    isResolved?: boolean;
    resolvedAt?: Date | string | null;
    resolvedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type FraudAlertUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    batchId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    qrCodeId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    alertType?: Prisma.EnumFraudAlertTypeFieldUpdateOperationsInput | $Enums.FraudAlertType;
    severity?: Prisma.EnumFraudSeverityFieldUpdateOperationsInput | $Enums.FraudSeverity;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    evidence?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    isResolved?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    resolvedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    resolvedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneWithoutFraudAlertsNestedInput;
};
export type FraudAlertUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    batchId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    qrCodeId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    alertType?: Prisma.EnumFraudAlertTypeFieldUpdateOperationsInput | $Enums.FraudAlertType;
    severity?: Prisma.EnumFraudSeverityFieldUpdateOperationsInput | $Enums.FraudSeverity;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    evidence?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    isResolved?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    resolvedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    resolvedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type FraudAlertCreateManyInput = {
    id?: string;
    batchId?: string | null;
    qrCodeId?: string | null;
    userId?: string | null;
    alertType: $Enums.FraudAlertType;
    severity?: $Enums.FraudSeverity;
    description: string;
    evidence?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    isResolved?: boolean;
    resolvedAt?: Date | string | null;
    resolvedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type FraudAlertUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    batchId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    qrCodeId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    alertType?: Prisma.EnumFraudAlertTypeFieldUpdateOperationsInput | $Enums.FraudAlertType;
    severity?: Prisma.EnumFraudSeverityFieldUpdateOperationsInput | $Enums.FraudSeverity;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    evidence?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    isResolved?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    resolvedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    resolvedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type FraudAlertUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    batchId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    qrCodeId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    userId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    alertType?: Prisma.EnumFraudAlertTypeFieldUpdateOperationsInput | $Enums.FraudAlertType;
    severity?: Prisma.EnumFraudSeverityFieldUpdateOperationsInput | $Enums.FraudSeverity;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    evidence?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    isResolved?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    resolvedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    resolvedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type FraudAlertListRelationFilter = {
    every?: Prisma.FraudAlertWhereInput;
    some?: Prisma.FraudAlertWhereInput;
    none?: Prisma.FraudAlertWhereInput;
};
export type FraudAlertOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type FraudAlertCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    batchId?: Prisma.SortOrder;
    qrCodeId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    alertType?: Prisma.SortOrder;
    severity?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    evidence?: Prisma.SortOrder;
    isResolved?: Prisma.SortOrder;
    resolvedAt?: Prisma.SortOrder;
    resolvedBy?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type FraudAlertMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    batchId?: Prisma.SortOrder;
    qrCodeId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    alertType?: Prisma.SortOrder;
    severity?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    isResolved?: Prisma.SortOrder;
    resolvedAt?: Prisma.SortOrder;
    resolvedBy?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type FraudAlertMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    batchId?: Prisma.SortOrder;
    qrCodeId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    alertType?: Prisma.SortOrder;
    severity?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    isResolved?: Prisma.SortOrder;
    resolvedAt?: Prisma.SortOrder;
    resolvedBy?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type FraudAlertCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.FraudAlertCreateWithoutUserInput, Prisma.FraudAlertUncheckedCreateWithoutUserInput> | Prisma.FraudAlertCreateWithoutUserInput[] | Prisma.FraudAlertUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.FraudAlertCreateOrConnectWithoutUserInput | Prisma.FraudAlertCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.FraudAlertCreateManyUserInputEnvelope;
    connect?: Prisma.FraudAlertWhereUniqueInput | Prisma.FraudAlertWhereUniqueInput[];
};
export type FraudAlertUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.FraudAlertCreateWithoutUserInput, Prisma.FraudAlertUncheckedCreateWithoutUserInput> | Prisma.FraudAlertCreateWithoutUserInput[] | Prisma.FraudAlertUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.FraudAlertCreateOrConnectWithoutUserInput | Prisma.FraudAlertCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.FraudAlertCreateManyUserInputEnvelope;
    connect?: Prisma.FraudAlertWhereUniqueInput | Prisma.FraudAlertWhereUniqueInput[];
};
export type FraudAlertUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.FraudAlertCreateWithoutUserInput, Prisma.FraudAlertUncheckedCreateWithoutUserInput> | Prisma.FraudAlertCreateWithoutUserInput[] | Prisma.FraudAlertUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.FraudAlertCreateOrConnectWithoutUserInput | Prisma.FraudAlertCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.FraudAlertUpsertWithWhereUniqueWithoutUserInput | Prisma.FraudAlertUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.FraudAlertCreateManyUserInputEnvelope;
    set?: Prisma.FraudAlertWhereUniqueInput | Prisma.FraudAlertWhereUniqueInput[];
    disconnect?: Prisma.FraudAlertWhereUniqueInput | Prisma.FraudAlertWhereUniqueInput[];
    delete?: Prisma.FraudAlertWhereUniqueInput | Prisma.FraudAlertWhereUniqueInput[];
    connect?: Prisma.FraudAlertWhereUniqueInput | Prisma.FraudAlertWhereUniqueInput[];
    update?: Prisma.FraudAlertUpdateWithWhereUniqueWithoutUserInput | Prisma.FraudAlertUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.FraudAlertUpdateManyWithWhereWithoutUserInput | Prisma.FraudAlertUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.FraudAlertScalarWhereInput | Prisma.FraudAlertScalarWhereInput[];
};
export type FraudAlertUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.FraudAlertCreateWithoutUserInput, Prisma.FraudAlertUncheckedCreateWithoutUserInput> | Prisma.FraudAlertCreateWithoutUserInput[] | Prisma.FraudAlertUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.FraudAlertCreateOrConnectWithoutUserInput | Prisma.FraudAlertCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.FraudAlertUpsertWithWhereUniqueWithoutUserInput | Prisma.FraudAlertUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.FraudAlertCreateManyUserInputEnvelope;
    set?: Prisma.FraudAlertWhereUniqueInput | Prisma.FraudAlertWhereUniqueInput[];
    disconnect?: Prisma.FraudAlertWhereUniqueInput | Prisma.FraudAlertWhereUniqueInput[];
    delete?: Prisma.FraudAlertWhereUniqueInput | Prisma.FraudAlertWhereUniqueInput[];
    connect?: Prisma.FraudAlertWhereUniqueInput | Prisma.FraudAlertWhereUniqueInput[];
    update?: Prisma.FraudAlertUpdateWithWhereUniqueWithoutUserInput | Prisma.FraudAlertUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.FraudAlertUpdateManyWithWhereWithoutUserInput | Prisma.FraudAlertUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.FraudAlertScalarWhereInput | Prisma.FraudAlertScalarWhereInput[];
};
export type EnumFraudAlertTypeFieldUpdateOperationsInput = {
    set?: $Enums.FraudAlertType;
};
export type EnumFraudSeverityFieldUpdateOperationsInput = {
    set?: $Enums.FraudSeverity;
};
export type FraudAlertCreateWithoutUserInput = {
    id?: string;
    batchId?: string | null;
    qrCodeId?: string | null;
    alertType: $Enums.FraudAlertType;
    severity?: $Enums.FraudSeverity;
    description: string;
    evidence?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    isResolved?: boolean;
    resolvedAt?: Date | string | null;
    resolvedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type FraudAlertUncheckedCreateWithoutUserInput = {
    id?: string;
    batchId?: string | null;
    qrCodeId?: string | null;
    alertType: $Enums.FraudAlertType;
    severity?: $Enums.FraudSeverity;
    description: string;
    evidence?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    isResolved?: boolean;
    resolvedAt?: Date | string | null;
    resolvedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type FraudAlertCreateOrConnectWithoutUserInput = {
    where: Prisma.FraudAlertWhereUniqueInput;
    create: Prisma.XOR<Prisma.FraudAlertCreateWithoutUserInput, Prisma.FraudAlertUncheckedCreateWithoutUserInput>;
};
export type FraudAlertCreateManyUserInputEnvelope = {
    data: Prisma.FraudAlertCreateManyUserInput | Prisma.FraudAlertCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type FraudAlertUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.FraudAlertWhereUniqueInput;
    update: Prisma.XOR<Prisma.FraudAlertUpdateWithoutUserInput, Prisma.FraudAlertUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.FraudAlertCreateWithoutUserInput, Prisma.FraudAlertUncheckedCreateWithoutUserInput>;
};
export type FraudAlertUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.FraudAlertWhereUniqueInput;
    data: Prisma.XOR<Prisma.FraudAlertUpdateWithoutUserInput, Prisma.FraudAlertUncheckedUpdateWithoutUserInput>;
};
export type FraudAlertUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.FraudAlertScalarWhereInput;
    data: Prisma.XOR<Prisma.FraudAlertUpdateManyMutationInput, Prisma.FraudAlertUncheckedUpdateManyWithoutUserInput>;
};
export type FraudAlertScalarWhereInput = {
    AND?: Prisma.FraudAlertScalarWhereInput | Prisma.FraudAlertScalarWhereInput[];
    OR?: Prisma.FraudAlertScalarWhereInput[];
    NOT?: Prisma.FraudAlertScalarWhereInput | Prisma.FraudAlertScalarWhereInput[];
    id?: Prisma.StringFilter<"FraudAlert"> | string;
    batchId?: Prisma.StringNullableFilter<"FraudAlert"> | string | null;
    qrCodeId?: Prisma.StringNullableFilter<"FraudAlert"> | string | null;
    userId?: Prisma.StringNullableFilter<"FraudAlert"> | string | null;
    alertType?: Prisma.EnumFraudAlertTypeFilter<"FraudAlert"> | $Enums.FraudAlertType;
    severity?: Prisma.EnumFraudSeverityFilter<"FraudAlert"> | $Enums.FraudSeverity;
    description?: Prisma.StringFilter<"FraudAlert"> | string;
    evidence?: Prisma.JsonNullableFilter<"FraudAlert">;
    isResolved?: Prisma.BoolFilter<"FraudAlert"> | boolean;
    resolvedAt?: Prisma.DateTimeNullableFilter<"FraudAlert"> | Date | string | null;
    resolvedBy?: Prisma.StringNullableFilter<"FraudAlert"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"FraudAlert"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"FraudAlert"> | Date | string;
};
export type FraudAlertCreateManyUserInput = {
    id?: string;
    batchId?: string | null;
    qrCodeId?: string | null;
    alertType: $Enums.FraudAlertType;
    severity?: $Enums.FraudSeverity;
    description: string;
    evidence?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    isResolved?: boolean;
    resolvedAt?: Date | string | null;
    resolvedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type FraudAlertUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    batchId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    qrCodeId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    alertType?: Prisma.EnumFraudAlertTypeFieldUpdateOperationsInput | $Enums.FraudAlertType;
    severity?: Prisma.EnumFraudSeverityFieldUpdateOperationsInput | $Enums.FraudSeverity;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    evidence?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    isResolved?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    resolvedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    resolvedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type FraudAlertUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    batchId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    qrCodeId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    alertType?: Prisma.EnumFraudAlertTypeFieldUpdateOperationsInput | $Enums.FraudAlertType;
    severity?: Prisma.EnumFraudSeverityFieldUpdateOperationsInput | $Enums.FraudSeverity;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    evidence?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    isResolved?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    resolvedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    resolvedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type FraudAlertUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    batchId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    qrCodeId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    alertType?: Prisma.EnumFraudAlertTypeFieldUpdateOperationsInput | $Enums.FraudAlertType;
    severity?: Prisma.EnumFraudSeverityFieldUpdateOperationsInput | $Enums.FraudSeverity;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    evidence?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    isResolved?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    resolvedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    resolvedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type FraudAlertSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    batchId?: boolean;
    qrCodeId?: boolean;
    userId?: boolean;
    alertType?: boolean;
    severity?: boolean;
    description?: boolean;
    evidence?: boolean;
    isResolved?: boolean;
    resolvedAt?: boolean;
    resolvedBy?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.FraudAlert$userArgs<ExtArgs>;
}, ExtArgs["result"]["fraudAlert"]>;
export type FraudAlertSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    batchId?: boolean;
    qrCodeId?: boolean;
    userId?: boolean;
    alertType?: boolean;
    severity?: boolean;
    description?: boolean;
    evidence?: boolean;
    isResolved?: boolean;
    resolvedAt?: boolean;
    resolvedBy?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.FraudAlert$userArgs<ExtArgs>;
}, ExtArgs["result"]["fraudAlert"]>;
export type FraudAlertSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    batchId?: boolean;
    qrCodeId?: boolean;
    userId?: boolean;
    alertType?: boolean;
    severity?: boolean;
    description?: boolean;
    evidence?: boolean;
    isResolved?: boolean;
    resolvedAt?: boolean;
    resolvedBy?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.FraudAlert$userArgs<ExtArgs>;
}, ExtArgs["result"]["fraudAlert"]>;
export type FraudAlertSelectScalar = {
    id?: boolean;
    batchId?: boolean;
    qrCodeId?: boolean;
    userId?: boolean;
    alertType?: boolean;
    severity?: boolean;
    description?: boolean;
    evidence?: boolean;
    isResolved?: boolean;
    resolvedAt?: boolean;
    resolvedBy?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type FraudAlertOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "batchId" | "qrCodeId" | "userId" | "alertType" | "severity" | "description" | "evidence" | "isResolved" | "resolvedAt" | "resolvedBy" | "createdAt" | "updatedAt", ExtArgs["result"]["fraudAlert"]>;
export type FraudAlertInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.FraudAlert$userArgs<ExtArgs>;
};
export type FraudAlertIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.FraudAlert$userArgs<ExtArgs>;
};
export type FraudAlertIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.FraudAlert$userArgs<ExtArgs>;
};
export type $FraudAlertPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "FraudAlert";
    objects: {
        user: Prisma.$UserPayload<ExtArgs> | null;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        batchId: string | null;
        qrCodeId: string | null;
        userId: string | null;
        alertType: $Enums.FraudAlertType;
        severity: $Enums.FraudSeverity;
        description: string;
        evidence: runtime.JsonValue | null;
        isResolved: boolean;
        resolvedAt: Date | null;
        resolvedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["fraudAlert"]>;
    composites: {};
};
export type FraudAlertGetPayload<S extends boolean | null | undefined | FraudAlertDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$FraudAlertPayload, S>;
export type FraudAlertCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<FraudAlertFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: FraudAlertCountAggregateInputType | true;
};
export interface FraudAlertDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['FraudAlert'];
        meta: {
            name: 'FraudAlert';
        };
    };
    /**
     * Find zero or one FraudAlert that matches the filter.
     * @param {FraudAlertFindUniqueArgs} args - Arguments to find a FraudAlert
     * @example
     * // Get one FraudAlert
     * const fraudAlert = await prisma.fraudAlert.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FraudAlertFindUniqueArgs>(args: Prisma.SelectSubset<T, FraudAlertFindUniqueArgs<ExtArgs>>): Prisma.Prisma__FraudAlertClient<runtime.Types.Result.GetResult<Prisma.$FraudAlertPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one FraudAlert that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FraudAlertFindUniqueOrThrowArgs} args - Arguments to find a FraudAlert
     * @example
     * // Get one FraudAlert
     * const fraudAlert = await prisma.fraudAlert.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FraudAlertFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, FraudAlertFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__FraudAlertClient<runtime.Types.Result.GetResult<Prisma.$FraudAlertPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first FraudAlert that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FraudAlertFindFirstArgs} args - Arguments to find a FraudAlert
     * @example
     * // Get one FraudAlert
     * const fraudAlert = await prisma.fraudAlert.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FraudAlertFindFirstArgs>(args?: Prisma.SelectSubset<T, FraudAlertFindFirstArgs<ExtArgs>>): Prisma.Prisma__FraudAlertClient<runtime.Types.Result.GetResult<Prisma.$FraudAlertPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first FraudAlert that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FraudAlertFindFirstOrThrowArgs} args - Arguments to find a FraudAlert
     * @example
     * // Get one FraudAlert
     * const fraudAlert = await prisma.fraudAlert.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FraudAlertFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, FraudAlertFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__FraudAlertClient<runtime.Types.Result.GetResult<Prisma.$FraudAlertPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more FraudAlerts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FraudAlertFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FraudAlerts
     * const fraudAlerts = await prisma.fraudAlert.findMany()
     *
     * // Get first 10 FraudAlerts
     * const fraudAlerts = await prisma.fraudAlert.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const fraudAlertWithIdOnly = await prisma.fraudAlert.findMany({ select: { id: true } })
     *
     */
    findMany<T extends FraudAlertFindManyArgs>(args?: Prisma.SelectSubset<T, FraudAlertFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$FraudAlertPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a FraudAlert.
     * @param {FraudAlertCreateArgs} args - Arguments to create a FraudAlert.
     * @example
     * // Create one FraudAlert
     * const FraudAlert = await prisma.fraudAlert.create({
     *   data: {
     *     // ... data to create a FraudAlert
     *   }
     * })
     *
     */
    create<T extends FraudAlertCreateArgs>(args: Prisma.SelectSubset<T, FraudAlertCreateArgs<ExtArgs>>): Prisma.Prisma__FraudAlertClient<runtime.Types.Result.GetResult<Prisma.$FraudAlertPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many FraudAlerts.
     * @param {FraudAlertCreateManyArgs} args - Arguments to create many FraudAlerts.
     * @example
     * // Create many FraudAlerts
     * const fraudAlert = await prisma.fraudAlert.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends FraudAlertCreateManyArgs>(args?: Prisma.SelectSubset<T, FraudAlertCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many FraudAlerts and returns the data saved in the database.
     * @param {FraudAlertCreateManyAndReturnArgs} args - Arguments to create many FraudAlerts.
     * @example
     * // Create many FraudAlerts
     * const fraudAlert = await prisma.fraudAlert.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many FraudAlerts and only return the `id`
     * const fraudAlertWithIdOnly = await prisma.fraudAlert.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends FraudAlertCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, FraudAlertCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$FraudAlertPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a FraudAlert.
     * @param {FraudAlertDeleteArgs} args - Arguments to delete one FraudAlert.
     * @example
     * // Delete one FraudAlert
     * const FraudAlert = await prisma.fraudAlert.delete({
     *   where: {
     *     // ... filter to delete one FraudAlert
     *   }
     * })
     *
     */
    delete<T extends FraudAlertDeleteArgs>(args: Prisma.SelectSubset<T, FraudAlertDeleteArgs<ExtArgs>>): Prisma.Prisma__FraudAlertClient<runtime.Types.Result.GetResult<Prisma.$FraudAlertPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one FraudAlert.
     * @param {FraudAlertUpdateArgs} args - Arguments to update one FraudAlert.
     * @example
     * // Update one FraudAlert
     * const fraudAlert = await prisma.fraudAlert.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends FraudAlertUpdateArgs>(args: Prisma.SelectSubset<T, FraudAlertUpdateArgs<ExtArgs>>): Prisma.Prisma__FraudAlertClient<runtime.Types.Result.GetResult<Prisma.$FraudAlertPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more FraudAlerts.
     * @param {FraudAlertDeleteManyArgs} args - Arguments to filter FraudAlerts to delete.
     * @example
     * // Delete a few FraudAlerts
     * const { count } = await prisma.fraudAlert.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends FraudAlertDeleteManyArgs>(args?: Prisma.SelectSubset<T, FraudAlertDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more FraudAlerts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FraudAlertUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FraudAlerts
     * const fraudAlert = await prisma.fraudAlert.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends FraudAlertUpdateManyArgs>(args: Prisma.SelectSubset<T, FraudAlertUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more FraudAlerts and returns the data updated in the database.
     * @param {FraudAlertUpdateManyAndReturnArgs} args - Arguments to update many FraudAlerts.
     * @example
     * // Update many FraudAlerts
     * const fraudAlert = await prisma.fraudAlert.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more FraudAlerts and only return the `id`
     * const fraudAlertWithIdOnly = await prisma.fraudAlert.updateManyAndReturn({
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
    updateManyAndReturn<T extends FraudAlertUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, FraudAlertUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$FraudAlertPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one FraudAlert.
     * @param {FraudAlertUpsertArgs} args - Arguments to update or create a FraudAlert.
     * @example
     * // Update or create a FraudAlert
     * const fraudAlert = await prisma.fraudAlert.upsert({
     *   create: {
     *     // ... data to create a FraudAlert
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FraudAlert we want to update
     *   }
     * })
     */
    upsert<T extends FraudAlertUpsertArgs>(args: Prisma.SelectSubset<T, FraudAlertUpsertArgs<ExtArgs>>): Prisma.Prisma__FraudAlertClient<runtime.Types.Result.GetResult<Prisma.$FraudAlertPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of FraudAlerts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FraudAlertCountArgs} args - Arguments to filter FraudAlerts to count.
     * @example
     * // Count the number of FraudAlerts
     * const count = await prisma.fraudAlert.count({
     *   where: {
     *     // ... the filter for the FraudAlerts we want to count
     *   }
     * })
    **/
    count<T extends FraudAlertCountArgs>(args?: Prisma.Subset<T, FraudAlertCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], FraudAlertCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a FraudAlert.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FraudAlertAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends FraudAlertAggregateArgs>(args: Prisma.Subset<T, FraudAlertAggregateArgs>): Prisma.PrismaPromise<GetFraudAlertAggregateType<T>>;
    /**
     * Group by FraudAlert.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FraudAlertGroupByArgs} args - Group by arguments.
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
    groupBy<T extends FraudAlertGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: FraudAlertGroupByArgs['orderBy'];
    } : {
        orderBy?: FraudAlertGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, FraudAlertGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFraudAlertGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the FraudAlert model
     */
    readonly fields: FraudAlertFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for FraudAlert.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__FraudAlertClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.FraudAlert$userArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.FraudAlert$userArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
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
 * Fields of the FraudAlert model
 */
export interface FraudAlertFieldRefs {
    readonly id: Prisma.FieldRef<"FraudAlert", 'String'>;
    readonly batchId: Prisma.FieldRef<"FraudAlert", 'String'>;
    readonly qrCodeId: Prisma.FieldRef<"FraudAlert", 'String'>;
    readonly userId: Prisma.FieldRef<"FraudAlert", 'String'>;
    readonly alertType: Prisma.FieldRef<"FraudAlert", 'FraudAlertType'>;
    readonly severity: Prisma.FieldRef<"FraudAlert", 'FraudSeverity'>;
    readonly description: Prisma.FieldRef<"FraudAlert", 'String'>;
    readonly evidence: Prisma.FieldRef<"FraudAlert", 'Json'>;
    readonly isResolved: Prisma.FieldRef<"FraudAlert", 'Boolean'>;
    readonly resolvedAt: Prisma.FieldRef<"FraudAlert", 'DateTime'>;
    readonly resolvedBy: Prisma.FieldRef<"FraudAlert", 'String'>;
    readonly createdAt: Prisma.FieldRef<"FraudAlert", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"FraudAlert", 'DateTime'>;
}
/**
 * FraudAlert findUnique
 */
export type FraudAlertFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FraudAlert
     */
    select?: Prisma.FraudAlertSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the FraudAlert
     */
    omit?: Prisma.FraudAlertOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.FraudAlertInclude<ExtArgs> | null;
    /**
     * Filter, which FraudAlert to fetch.
     */
    where: Prisma.FraudAlertWhereUniqueInput;
};
/**
 * FraudAlert findUniqueOrThrow
 */
export type FraudAlertFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FraudAlert
     */
    select?: Prisma.FraudAlertSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the FraudAlert
     */
    omit?: Prisma.FraudAlertOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.FraudAlertInclude<ExtArgs> | null;
    /**
     * Filter, which FraudAlert to fetch.
     */
    where: Prisma.FraudAlertWhereUniqueInput;
};
/**
 * FraudAlert findFirst
 */
export type FraudAlertFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FraudAlert
     */
    select?: Prisma.FraudAlertSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the FraudAlert
     */
    omit?: Prisma.FraudAlertOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.FraudAlertInclude<ExtArgs> | null;
    /**
     * Filter, which FraudAlert to fetch.
     */
    where?: Prisma.FraudAlertWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of FraudAlerts to fetch.
     */
    orderBy?: Prisma.FraudAlertOrderByWithRelationInput | Prisma.FraudAlertOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for FraudAlerts.
     */
    cursor?: Prisma.FraudAlertWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` FraudAlerts from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` FraudAlerts.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of FraudAlerts.
     */
    distinct?: Prisma.FraudAlertScalarFieldEnum | Prisma.FraudAlertScalarFieldEnum[];
};
/**
 * FraudAlert findFirstOrThrow
 */
export type FraudAlertFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FraudAlert
     */
    select?: Prisma.FraudAlertSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the FraudAlert
     */
    omit?: Prisma.FraudAlertOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.FraudAlertInclude<ExtArgs> | null;
    /**
     * Filter, which FraudAlert to fetch.
     */
    where?: Prisma.FraudAlertWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of FraudAlerts to fetch.
     */
    orderBy?: Prisma.FraudAlertOrderByWithRelationInput | Prisma.FraudAlertOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for FraudAlerts.
     */
    cursor?: Prisma.FraudAlertWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` FraudAlerts from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` FraudAlerts.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of FraudAlerts.
     */
    distinct?: Prisma.FraudAlertScalarFieldEnum | Prisma.FraudAlertScalarFieldEnum[];
};
/**
 * FraudAlert findMany
 */
export type FraudAlertFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FraudAlert
     */
    select?: Prisma.FraudAlertSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the FraudAlert
     */
    omit?: Prisma.FraudAlertOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.FraudAlertInclude<ExtArgs> | null;
    /**
     * Filter, which FraudAlerts to fetch.
     */
    where?: Prisma.FraudAlertWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of FraudAlerts to fetch.
     */
    orderBy?: Prisma.FraudAlertOrderByWithRelationInput | Prisma.FraudAlertOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing FraudAlerts.
     */
    cursor?: Prisma.FraudAlertWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` FraudAlerts from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` FraudAlerts.
     */
    skip?: number;
    distinct?: Prisma.FraudAlertScalarFieldEnum | Prisma.FraudAlertScalarFieldEnum[];
};
/**
 * FraudAlert create
 */
export type FraudAlertCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FraudAlert
     */
    select?: Prisma.FraudAlertSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the FraudAlert
     */
    omit?: Prisma.FraudAlertOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.FraudAlertInclude<ExtArgs> | null;
    /**
     * The data needed to create a FraudAlert.
     */
    data: Prisma.XOR<Prisma.FraudAlertCreateInput, Prisma.FraudAlertUncheckedCreateInput>;
};
/**
 * FraudAlert createMany
 */
export type FraudAlertCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many FraudAlerts.
     */
    data: Prisma.FraudAlertCreateManyInput | Prisma.FraudAlertCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * FraudAlert createManyAndReturn
 */
export type FraudAlertCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FraudAlert
     */
    select?: Prisma.FraudAlertSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the FraudAlert
     */
    omit?: Prisma.FraudAlertOmit<ExtArgs> | null;
    /**
     * The data used to create many FraudAlerts.
     */
    data: Prisma.FraudAlertCreateManyInput | Prisma.FraudAlertCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.FraudAlertIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * FraudAlert update
 */
export type FraudAlertUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FraudAlert
     */
    select?: Prisma.FraudAlertSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the FraudAlert
     */
    omit?: Prisma.FraudAlertOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.FraudAlertInclude<ExtArgs> | null;
    /**
     * The data needed to update a FraudAlert.
     */
    data: Prisma.XOR<Prisma.FraudAlertUpdateInput, Prisma.FraudAlertUncheckedUpdateInput>;
    /**
     * Choose, which FraudAlert to update.
     */
    where: Prisma.FraudAlertWhereUniqueInput;
};
/**
 * FraudAlert updateMany
 */
export type FraudAlertUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update FraudAlerts.
     */
    data: Prisma.XOR<Prisma.FraudAlertUpdateManyMutationInput, Prisma.FraudAlertUncheckedUpdateManyInput>;
    /**
     * Filter which FraudAlerts to update
     */
    where?: Prisma.FraudAlertWhereInput;
    /**
     * Limit how many FraudAlerts to update.
     */
    limit?: number;
};
/**
 * FraudAlert updateManyAndReturn
 */
export type FraudAlertUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FraudAlert
     */
    select?: Prisma.FraudAlertSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the FraudAlert
     */
    omit?: Prisma.FraudAlertOmit<ExtArgs> | null;
    /**
     * The data used to update FraudAlerts.
     */
    data: Prisma.XOR<Prisma.FraudAlertUpdateManyMutationInput, Prisma.FraudAlertUncheckedUpdateManyInput>;
    /**
     * Filter which FraudAlerts to update
     */
    where?: Prisma.FraudAlertWhereInput;
    /**
     * Limit how many FraudAlerts to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.FraudAlertIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * FraudAlert upsert
 */
export type FraudAlertUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FraudAlert
     */
    select?: Prisma.FraudAlertSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the FraudAlert
     */
    omit?: Prisma.FraudAlertOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.FraudAlertInclude<ExtArgs> | null;
    /**
     * The filter to search for the FraudAlert to update in case it exists.
     */
    where: Prisma.FraudAlertWhereUniqueInput;
    /**
     * In case the FraudAlert found by the `where` argument doesn't exist, create a new FraudAlert with this data.
     */
    create: Prisma.XOR<Prisma.FraudAlertCreateInput, Prisma.FraudAlertUncheckedCreateInput>;
    /**
     * In case the FraudAlert was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.FraudAlertUpdateInput, Prisma.FraudAlertUncheckedUpdateInput>;
};
/**
 * FraudAlert delete
 */
export type FraudAlertDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FraudAlert
     */
    select?: Prisma.FraudAlertSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the FraudAlert
     */
    omit?: Prisma.FraudAlertOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.FraudAlertInclude<ExtArgs> | null;
    /**
     * Filter which FraudAlert to delete.
     */
    where: Prisma.FraudAlertWhereUniqueInput;
};
/**
 * FraudAlert deleteMany
 */
export type FraudAlertDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which FraudAlerts to delete
     */
    where?: Prisma.FraudAlertWhereInput;
    /**
     * Limit how many FraudAlerts to delete.
     */
    limit?: number;
};
/**
 * FraudAlert.user
 */
export type FraudAlert$userArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
 * FraudAlert without action
 */
export type FraudAlertDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FraudAlert
     */
    select?: Prisma.FraudAlertSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the FraudAlert
     */
    omit?: Prisma.FraudAlertOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.FraudAlertInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=FraudAlert.d.ts.map