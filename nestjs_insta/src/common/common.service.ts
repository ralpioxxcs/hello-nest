import { BadRequestException, Injectable } from '@nestjs/common';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { BasePaginationDto } from './dto/basic-pagination.dto';
import { BaseModel } from './entity/base.entity';
import { FILTER_MAPPER } from './const/filter-mappter.const';
import { ENV_HOST_KEY, ENV_PROTOCOL_KEY } from './const/env-keys.consts';

@Injectable()
export class CommonService {
  constructor(private readonly configService: ConfigService) {}

  paginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path?: string,
  ) {
    if (dto.page) {
      return this.pagePaginate(dto, repository, overrideFindOptions);
    }
    return this.cursorPaginate(dto, repository, overrideFindOptions, path);
  }

  private async pagePaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
  ) {
    const findOptions = this.composeFindOptions<T>(dto);

    const [data, count] = await repository.findAndCount({
      ...findOptions,
      ...overrideFindOptions,
    });

    return {
      data,
      total: count,
    };
  }

  private async cursorPaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path?: string,
  ) {
    // where__likeCount__more_than
    // where__title__ilike
    const findOptions = this.composeFindOptions<T>(dto);

    const results = await repository.find({
      ...findOptions,
      ...overrideFindOptions,
    });

    // 해당되는 post가 0개 이상이면,
    //  -> 마지막 포스트를 가져오고
    //  -> 아니면 null반환
    //
    //  마지막페이지 체크
    const lastItem =
      results.length > 0 && results.length === dto.take
        ? results[results.length - 1]
        : null;

    const protocol = this.configService.get<string>(ENV_PROTOCOL_KEY);
    const host = this.configService.get<string>(ENV_HOST_KEY);

    const nextUrl = lastItem && new URL(`${protocol}://${host}/${path}`);
    if (nextUrl) {
      // dto의 key값들을 순회하면서 키값에 해당되는 값이 존재하면 param에 붙여넣는다
      // 단, 'where__id__more_than' 값만 lastItem의 마지막값으로 넣어준다.
      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (
            key !== 'where__id__more_than' &&
            key !== 'where__id__less_than'
          ) {
            nextUrl.searchParams.append(key, dto[key]);
          }
        }
      }

      let key = null;
      if (dto.order__createdAt === 'ASC') {
        key = 'where__id__more_than';
      } else {
        key = 'where__id__less_than';
      }

      nextUrl.searchParams.append(key, lastItem.id.toString());
    }

    return {
      data: results,
      cursor: {
        after: lastItem?.id ?? null, // 'undefined' or 'null', 0 등 false값이 아닐경우에만 넣어준다
      },
      count: results.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  private composeFindOptions<T extends BaseModel>(
    dto: BasePaginationDto,
  ): FindManyOptions<T> {
    // where, order, take, skip -> page기반일 때만

    // DTO의 현재 생긴 구조를 아래와 같음
    // {
    //      where__id__more_than: 1,
    //      order__createdAt: 'ASC',
    // }
    // 현재는 where__id__more_than, where__id__less_than에 해당되는 where 필터만 사용중이지만,
    // 나중에, where__likeCount__more_than 혹은 where__title__ilike등 추가적인 필터를 넣고싶어졌을때
    // 모든 where를 자동으로 파싱할 수 있을만한 기능을 제작해야한다.
    //
    // 1) where로 시작한다면 필터 로직을 적용한다.
    // 2) order로 시작한다면 정렬 로직을 적용한다.
    // 3) 필터 로직을 적용한다면 '__' 기준으로 split했을때, 3개의 값, 2개의 값으로 나뉘는지 확인
    //  3-1) 3개의 값 나뉨 -> FILTER_MAPPER에서 해당되는 operator 함수를 찾아 적용
    //       ['where', 'id', 'more_than']
    //
    //  3-2) 2개의 값 나뉨 -> 정확한 값을 filter하는것이기 때문에 operator없이 적용
    //       ['where', 'id']
    //
    //  4) order는 3-2와 같이 적용

    let where: FindOptionsWhere<T> = {};
    let order: FindOptionsOrder<T> = {};

    for (const [key, value] of Object.entries(dto)) {
      // 1) key -> where__id__less_than
      //    value -> 1
      if (key.startsWith('where__')) {
        where = {
          ...where,
          ...this.parseWhereFilter(key, value),
        };
      } else if (key.startsWith('order__')) {
        order = {
          ...order,
          ...this.parseWhereFilter(key, value),
        };
      }
    }

    return {
      where,
      order,
      take: dto.take,
      skip: dto.page ? dto.take * (dto.page - 1) : null,
    };
  }

  private parseWhereFilter<T extends BaseModel>(
    key: string,
    value: any,
  ): FindOptionsWhere<T> | FindOptionsOrder<T> {
    const options: FindOptionsWhere<T> = {};

    /**
     * where__id__more_than
     * __를 기준으로 나눴을 때
     *
     * -> ['where', 'id', 'more_than']으로 나눌 수 있다.
     *
     * */
    const split = key.split('__');

    if (split.length !== 2 && split.length !== 3) {
      throw new BadRequestException(
        `length of where filter should be '2' or '3' when split using '__', problem key: ${key}`,
      );
    }

    if (split.length === 2) {
      /**
       * 길이가 2인 경우
       * where__id = 3
       * __를 기준으로 나눴을 때
       *
       * FindOptionsWhere로 풀어보면 -> {
       *  where: {
       *      id: 3,
       *  }
       * }
       *
       * */
      // ['where', 'id']
      const [_, field] = split;

      options[field] = value;
    } else {
      /**
       * 길이가 3인 경우 TypeORM의 유틸리티 적용이 필요
       *
       * where__id__more_than의 경우
       * where는 버려도 되고
       * 2번째 값을 필터할 key가 되고,
       * 3번째값은 TypeORM의 유틸리티가 됨
       *
       * FILTER_MAPPER에 미리 정의해둔 값들로 field값에 FILTER_MAPPER에서 해당되는 유틸리티를 가져온 후
       * 값에 적용
       *
       * */

      // ['where', 'id', 'more_than']
      const [_, field, operator] = split;

      // where__id__between = 3,4
      // 만약 split대상 문자가 없으면 길이가 무조건 '1'이다.
      const values = value.toString().split(',');

      // field -> id
      // oper  -> more_than
      // FILTER_MAPPER[oper] -> MoreThan
      if (operator == 'between') {
        options[field] = FILTER_MAPPER[operator](values[0], values[1]);
      } else if (operator == 'i_like') {
        options[field] = FILTER_MAPPER[operator](`%${value}%`);
      } else {
        options[field] = FILTER_MAPPER[operator](value);
      }
    }

    return options;
  }

  private parseOrderFilter<T extends BaseModel>(
    key: string,
    value: any,
  ): FindOptionsOrder<T> {
    const order: FindOptionsOrder<T> = {};

    // order는 무조건 2개로 split
    const split = key.split('__');

    if (split.length !== 2) {
      throw new BadRequestException(
        `length of order filter should be '2' when split using '__', problem key: ${key}`,
      );
    }

    const [_, field] = split;
    order[field] = value;

    return order;
  }
}
