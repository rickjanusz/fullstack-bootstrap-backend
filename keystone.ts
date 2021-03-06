import {createAuth} from '@keystone-next/auth'
import { config, createSchema, exte } from '@keystone-next/keystone/schema';
import {withItemData, statelessSessions} from '@keystone-next/keystone/session'
import 'dotenv/config';
import {User} from './schemas/User'
import {Product} from './schemas/Product'
import {CartItem} from './schemas/CartItem'
import {OrderItem} from './schemas/OrderItem'
import {Order} from './schemas/Order'
import {Role} from './schemas/Role'
import {ProductImage} from './schemas/ProductImage'
import { insertSeedData } from './seed-data';
import { sendPasswordResetEmail } from './lib/mail';
import { extendGraphqlSchema } from './mutations';
import { permissionsList } from './schemas/fields';

const databaseURL = process.env.DATABASE_URL || 'mongodb://localhost/keystone';

const sessionConfig = {
  maxAge: 60 * 60 * 24 * 365,
  secret: process.env.COOKIE_SECRET,
};


const {withAuth} = createAuth({
    listKey: 'User',
    identityField: 'email',
    secretField: 'password',
    initFirstItem: {
        fields: ['name', 'email', 'password'],
        //TODO: Add in initial roles here
    },
    passwordResetLink: {
      async sendToken(args) {
        // send the email
        await sendPasswordResetEmail(args.token, args.identity)
      }
    }
})



export default withAuth(config({
  server: {
    cors: {
      origin: [process.env.FRONTEND_URL],
      credentials: true,
    },
  },
  db: {
    adapter: 'mongoose',
    url: databaseURL,
    // insert seed data
    async onConnect(keystone) {
        if(process.argv.includes('--seed-data'))
        await insertSeedData(keystone);
    }
  },
  lists: createSchema({
    User,
    Product,
    ProductImage,
    CartItem,
    OrderItem,
    Order,
    Role
  }),
  extendGraphqlSchema: extendGraphqlSchema,
  ui: {
    // TODO: Change this for roles
    isAccessAllowed: ({session}) => {
        // console.log(session)
        return session?.data
    }
  },
  session: withItemData(statelessSessions(sessionConfig), {
      User: `id name email role { ${permissionsList.join(' ')} }`
  })
}));
