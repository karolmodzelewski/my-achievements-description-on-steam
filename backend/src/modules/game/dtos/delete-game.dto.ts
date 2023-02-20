import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteGameDto {
    @IsString()
    @IsNotEmpty()
    public name: string;
}
