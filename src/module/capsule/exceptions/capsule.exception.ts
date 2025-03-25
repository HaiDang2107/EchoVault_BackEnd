import { HttpException, HttpStatus } from '@nestjs/common';

export class CapsuleNotFoundException extends HttpException {
    constructor() {
        super('Capsule not found', HttpStatus.NOT_FOUND);
    }
}

export class CapsuleNotOpenedException extends HttpException {
    constructor() {
        super('Capsule is not opened', HttpStatus.BAD_REQUEST);
    }
}