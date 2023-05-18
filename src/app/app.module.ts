import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatMessageComponent } from './chat-message/chat-message.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { EditChatDialogComponent } from './edit-chat-dialog/edit-chat-dialog.component';
import { HomeComponent } from './home/home.component';
import { NavColComponent } from './nav-col/nav-col.component';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PromptsComponent } from './prompts/prompts.component';

@NgModule({
  declarations: [
    AppComponent,
    ChatMessageComponent,
    ChatWindowComponent,
    NavColComponent,
    HomeComponent,
    ConfirmDialogComponent,
    EditChatDialogComponent,
    PromptsComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MarkdownModule.forRoot(),
    MatDialogModule,
    MatAutocompleteModule,
    MatMenuModule,
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    {
      provide: MarkedOptions,
      useValue: {
        breaks: true, // Enable Hard Line Breaks.
      },
    },],
  bootstrap: [AppComponent]
})
export class AppModule { }
