import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Home as LayoutHome} from './layout/home/home';
import { Products as LayoutProducts} from './layout/products/products';
import { Account as LayoutAccount } from './layout/account/account';
import { Dashboard } from './dashboard/dashboard';
import { Home } from './dashboard/home/home';
import { Products } from './dashboard/products/products';
import { Login } from './login/login';
import { NotFound } from './not-found/not-found';
import { SignUp } from './sign-up/sign-up';
import { Users } from './dashboard/users/users';
import { adminGuard } from './core/guards/admin-guard';
import { accountMatchGuard } from './core/guards/account-match-guard';
import { Categories } from './dashboard/categories/categories';
import { ProductResolverService } from './core/services/product-resolver.service';
import { ProductDetails } from './layout/product-details/product-details';
import { Cart } from './layout/cart/cart';
import { Order } from './dashboard/order/order';
import { About } from './layout/about/about';
import { Feedback } from './layout/feedback/feedback';
import { UserOrders } from './layout/user-orders/user-orders';

export const routes: Routes = [

 {path:"",component:Layout,children:[
    { path: "", redirectTo: "home", pathMatch: "full" },
    { path: "home", component: LayoutHome },
    { path: "account", loadComponent:()=>import('./layout/account/account').then(c=> c.Account),canMatch:[accountMatchGuard] },
   { path: "products", component: LayoutProducts },
   { path: "about", component: About },
   { path: "cart", component: Cart },
   { path: "account/orders", component: UserOrders },
   {
     path: "testimonial", component: Feedback

    },
    {path:"products/:slug",component:ProductDetails, resolve:{
        product:ProductResolverService
    }},


  ]
  },
  {
    path:"dashboard",component:Dashboard,canActivate:[adminGuard],children:[

      { path: "home", component: Home },
      { path: "products", component: Products },
      { path: "users", component: Users },
      { path: 'categories', component: Categories },
      {path:"orders",component:Order},

    ]

  }, {
    path:"login",component:Login
  }, {
    path: "signup",
    component: SignUp
  },
  {
    path:"**",component:NotFound
  }


];
