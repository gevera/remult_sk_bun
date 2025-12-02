import { Entity, Fields } from 'remult';
import { Roles } from '../../demo/auth/Roles';

@Entity('files', {
	allowApiCrud: false,
	allowApiInsert: 'signedIn',
	allowApiRead: 'signedIn',
	allowApiUpdate: false,
	allowApiDelete: Roles.Admin
})
export class File {
	@Fields.id()
	id!: string;

	@Fields.string()
	filename: string = '';

	@Fields.string()
	key: string = '';

	@Fields.string()
	mimeType: string = '';

	@Fields.number()
	size: number = 0;

	@Fields.string()
	uploadedBy: string = '';

	@Fields.createdAt()
	createdAt!: Date;

	@Fields.updatedAt()
	updatedAt?: Date;
}

