import { Entity, Fields } from 'remult';
import { Roles_S2Files } from './Roles_S2Files';

@Entity('files', {
	allowApiCrud: false,
	allowApiInsert: 'signedIn',
	allowApiRead: 'signedIn',
	allowApiUpdate: false,
	allowApiDelete: Roles_S2Files.S2Files_Admin
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

