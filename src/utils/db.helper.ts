import { SelectQueryBuilder } from "typeorm";
/*
 * @description: 本函数用于联表查询,可能有些查询条件为null,这时候就要判断了
 * @return {*}
 * @param {SelectQueryBuilder} queryBuilder
 * @param {Record} obj
 * @param {*} any
 */
export function conditionUtils<T>(queryBuilder: SelectQueryBuilder<T>, obj: Record<string, any>) {
    Object.keys(obj).forEach((key) => {
        if (!!obj[key]) { 
            queryBuilder.andWhere(`${key} = :${key}`,{[key]:obj[key]});
        }
     });
    return queryBuilder;
}