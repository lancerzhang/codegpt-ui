import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PromptsComponent } from './prompts/prompts.component';

const routes: Routes = [{ path: '', component: HomeComponent },
{ path: 'prompt', component: PromptsComponent },
{ path: 'chat/:conversationId', component: HomeComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
