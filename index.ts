

import { ItemFeed } from './dtos/item-feed.dto';
import { Repository } from './repository/repository';

const handler = (
    userId: string,
) => {
    // readTable<ItemFeed>(ItemFeed, { userId, }, {}, []);
    const repository = new Repository();
    ItemFeed.getUserItemFeed(repository, userId).then(result => {
        console.log('result', result)
    })
}

handler('user1')