import { AddGroupParticipants } from './add-group-participants.dto';
import { PartialType } from '@nestjs/mapped-types';

export class SelfUpdateGroupParticipants extends PartialType(
  AddGroupParticipants,
) {}
