import { Component, input } from '@angular/core';
import { Svg } from '../../ui-components/svg/svg';
import { Typography } from '../../ui-components/typography/typography';
import { TypographyTypeEnum } from '../../constants/typography';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-error-message',
  imports: [Svg, Typography, TranslatePipe],
  templateUrl: './error-message.html',
  styleUrl: './error-message.scss',
})
export class ErrorMessage {
   message = input('')
  protected readonly TypographyTypeEnum = TypographyTypeEnum;
}
