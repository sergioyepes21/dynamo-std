

import { ItemFeed } from './dtos/item-feed.dto';
import { Repository } from './repository/repository';

const handler = async (
    userId: string,
) => {
    // readTable<ItemFeed>(ItemFeed, { userId, }, {}, []);
    const repository = new Repository();
    let itemToCreate = new ItemFeed();
    itemToCreate.userId = '123';
    itemToCreate.priority = 20;
    itemToCreate.itemId = 'xyz-098';
    await ItemFeed.create(repository, itemToCreate).then(result => {
        console.log('result create', result)
    }).catch(e => {
        console.debug(`ItemFeed.create ~ e`, e);
    })

    // await ItemFeed.getUserItemFeed(repository, userId).then(result => {
    //     console.log('result read', result)
    // }).catch(e => {
    //     console.debug(`ItemFeed.getUserItemFeed ~ e`, e);
    // })
}

handler('user1')