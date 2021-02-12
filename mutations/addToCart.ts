import { KeystoneContext, SessionStore } from '@keystone-next/types';
import { Session } from '../types';

import { CartItemCreateInput } from '../.keystone/schema-types';

async function addToCart(
  root: any,
  { productId }: { productId: string },
  context: KeystoneContext
): Promise<CartItemCreateInput> {
//   console.log('ADDING TO CAAAAART!!!!');

  // 1. query the current user- are they signed in?
  const sesh = context.session as Session;
  if(!sesh.itemId) {
      throw new Error('You must be logged in to do this!')
  }
  // 2. query the cart
  const allCartItems = await context.lists.CartItem.findMany({
      where: {user: {id: sesh.itemId}, product: {id: productId}},
      resolveFields: 'id, quantity'
  })
//   console.log(allCartItems)
  const [existingCartItem] = allCartItems;
  // 3. is current item already in cart
  if(existingCartItem) {
      console.log(`There are already ${existingCartItem.quantity}, increment by 1!`);
      // 4. if it is, increment by 1
    return await context.lists.CartItem.updateOne({
        id: existingCartItem.id,
        data: {quantity: existingCartItem.quantity + 1},
    })
  }
  // 4. if it i not create a new cart item

  console.log(`There are not any already adding 1!`);
  return await context.lists.CartItem.createOne({
    data: {
        product: {connect: {id: productId }},
        user: {connect: {id: sesh.itemId }},
    },
})
}

export default addToCart;
