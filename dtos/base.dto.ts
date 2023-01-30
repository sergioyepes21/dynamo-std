
export class BaseDto {
    constructor(
        public PK?: string,
        public SK?: string,
        public createdAt?: Date,
        public updatedAt?: Date,
        public GSI1PK?: string,
        public GSI1SK?: string,
        public GSI2PK?: string,
        public GSI2SK?: string,
        public GSI3PK?: string,
        public GSI3SK?: string,
        public GSI4PK?: string,
        public GSI4SK?: string,
    ) { }

}