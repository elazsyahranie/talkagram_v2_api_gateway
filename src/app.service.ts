import { Injectable, BadGatewayException } from '@nestjs/common';
import { map } from 'zod';
import { externalApiResponse, finalResultType } from './external-api.interface';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async fetchExternalApi(
    results?: number,
    page?: number,
  ): Promise<finalResultType[]> {
    results = results ? results : 1;
    page = page ? page : 1;

    const res = await fetch(
      `https://randomuser.me/api?results=${results}&page=${page}`,
      {
        cache: 'no-store',
      },
    );
    if (!res.ok) {
      throw new BadGatewayException(502, 'Failed to fetch data');
    }

    const fetchedData = await res.json();

    let finalResult: finalResultType[] = [];
    if (fetchedData) {
      fetchedData.results.map((obj: externalApiResponse) => {
        finalResult.push({
          name: `${obj.name?.title}, ${obj.name?.first} ${obj.name?.last}`,
          location: `${String(obj.location?.postcode ?? '')}, ${obj.location?.city}, ${obj.location?.state}, ${obj.location?.country}`,
          email: `${obj.email}`,
          age: obj.dob?.age ?? 0,
          phone: `${obj.phone}`,
          cell: `${obj.cell}`,
          picture: [
            `${obj.picture?.large}`,
            `${obj.picture?.medium}`,
            `${obj.picture?.thumbnail}`,
          ],
        });
      });
    }

    return finalResult;
  }
}
